// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseFlow - DEX Aggregator & Trading Automation Protocol
 * @notice Trade smarter, flow faster on Base
 * @dev Aggregates liquidity from multiple DEXs with automated trading features
 */
contract BaseFlow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Structs ============
    
    struct DCAOrder {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountPerInterval;
        uint256 intervalsRemaining;
        uint256 intervalDuration;
        uint256 lastExecutionTime;
        uint256 minAmountOut;
        bool active;
    }

    struct LimitOrder {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 targetPrice; // in tokenOut per tokenIn (scaled by 1e18)
        uint256 minAmountOut;
        uint256 expiry;
        bool active;
    }

    struct StopLossOrder {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 stopPrice; // trigger price (scaled by 1e18)
        uint256 minAmountOut;
        uint256 expiry;
        bool active;
    }

    struct GridOrder {
        address user;
        address tokenA;
        address tokenB;
        uint256 totalAmountA;
        uint256 totalAmountB;
        uint256 gridLevels;
        uint256 lowerPrice;
        uint256 upperPrice;
        uint256 amountPerGrid;
        bool active;
    }

    // ============ State Variables ============

    // Supported DEX routers
    address[] public dexRouters;
    mapping(address => bool) public isDexRouter;
    mapping(address => string) public dexNames;

    // Orders
    mapping(uint256 => DCAOrder) public dcaOrders;
    mapping(uint256 => LimitOrder) public limitOrders;
    mapping(uint256 => StopLossOrder) public stopLossOrders;
    mapping(uint256 => GridOrder) public gridOrders;

    uint256 public dcaOrderCount;
    uint256 public limitOrderCount;
    uint256 public stopLossOrderCount;
    uint256 public gridOrderCount;

    // User order tracking
    mapping(address => uint256[]) public userDCAOrders;
    mapping(address => uint256[]) public userLimitOrders;
    mapping(address => uint256[]) public userStopLossOrders;
    mapping(address => uint256[]) public userGridOrders;

    // Fees (in basis points, 100 = 1%)
    uint256 public swapFee = 30; // 0.3%
    uint256 public automationFee = 50; // 0.5%
    uint256 public constant MAX_FEE = 100; // 1% max
    uint256 public constant FEE_DENOMINATOR = 10000;

    // Fee collection
    uint256 public collectedFeesETH;
    mapping(address => uint256) public collectedFeesToken;

    // Keepers for automation
    mapping(address => bool) public isKeeper;

    // ============ Events ============

    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address dexUsed
    );

    event DCAOrderCreated(uint256 indexed orderId, address indexed user, address tokenIn, address tokenOut);
    event DCAOrderExecuted(uint256 indexed orderId, uint256 amountIn, uint256 amountOut);
    event DCAOrderCancelled(uint256 indexed orderId);

    event LimitOrderCreated(uint256 indexed orderId, address indexed user, uint256 targetPrice);
    event LimitOrderExecuted(uint256 indexed orderId, uint256 amountIn, uint256 amountOut);
    event LimitOrderCancelled(uint256 indexed orderId);

    event StopLossOrderCreated(uint256 indexed orderId, address indexed user, uint256 stopPrice);
    event StopLossOrderExecuted(uint256 indexed orderId, uint256 amountIn, uint256 amountOut);
    event StopLossOrderCancelled(uint256 indexed orderId);

    event GridOrderCreated(uint256 indexed orderId, address indexed user, uint256 gridLevels);
    event GridOrderCancelled(uint256 indexed orderId);

    event DexAdded(address indexed router, string name);
    event DexRemoved(address indexed router);
    event FeesCollected(address indexed token, uint256 amount);
    event KeeperUpdated(address indexed keeper, bool status);

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {
        isKeeper[msg.sender] = true;
    }

    // ============ Modifiers ============

    modifier onlyKeeper() {
        require(isKeeper[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    // ============ DEX Management ============

    function addDex(address _router, string memory _name) external onlyOwner {
        require(_router != address(0), "Invalid router");
        require(!isDexRouter[_router], "Already added");
        
        dexRouters.push(_router);
        isDexRouter[_router] = true;
        dexNames[_router] = _name;
        
        emit DexAdded(_router, _name);
    }

    function removeDex(address _router) external onlyOwner {
        require(isDexRouter[_router], "Not a router");
        
        isDexRouter[_router] = false;
        
        for (uint i = 0; i < dexRouters.length; i++) {
            if (dexRouters[i] == _router) {
                dexRouters[i] = dexRouters[dexRouters.length - 1];
                dexRouters.pop();
                break;
            }
        }
        
        emit DexRemoved(_router);
    }

    function getDexRouters() external view returns (address[] memory) {
        return dexRouters;
    }

    // ============ Core Swap Function ============

    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _minAmountOut,
        address _dexRouter,
        bytes calldata _swapData
    ) external payable nonReentrant returns (uint256 amountOut) {
        require(isDexRouter[_dexRouter], "Invalid DEX");
        require(_amountIn > 0, "Zero amount");

        uint256 feeAmount;
        uint256 amountAfterFee;

        if (_tokenIn == address(0)) {
            // ETH swap
            require(msg.value >= _amountIn, "Insufficient ETH");
            feeAmount = (_amountIn * swapFee) / FEE_DENOMINATOR;
            amountAfterFee = _amountIn - feeAmount;
            collectedFeesETH += feeAmount;
        } else {
            // Token swap
            IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
            feeAmount = (_amountIn * swapFee) / FEE_DENOMINATOR;
            amountAfterFee = _amountIn - feeAmount;
            collectedFeesToken[_tokenIn] += feeAmount;
            
            // Approve DEX router
            IERC20(_tokenIn).approve(_dexRouter, amountAfterFee);
        }

        // Get balance before swap
        uint256 balanceBefore = _tokenOut == address(0) 
            ? address(this).balance 
            : IERC20(_tokenOut).balanceOf(address(this));

        // Execute swap on DEX
        if (_tokenIn == address(0)) {
            (bool success, ) = _dexRouter.call{value: amountAfterFee}(_swapData);
            require(success, "Swap failed");
        } else {
            (bool success, ) = _dexRouter.call(_swapData);
            require(success, "Swap failed");
        }

        // Calculate amount received
        uint256 balanceAfter = _tokenOut == address(0) 
            ? address(this).balance 
            : IERC20(_tokenOut).balanceOf(address(this));
        
        amountOut = balanceAfter - balanceBefore;
        require(amountOut >= _minAmountOut, "Slippage too high");

        // Transfer output to user
        if (_tokenOut == address(0)) {
            (bool success, ) = msg.sender.call{value: amountOut}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(_tokenOut).safeTransfer(msg.sender, amountOut);
        }

        emit Swap(msg.sender, _tokenIn, _tokenOut, _amountIn, amountOut, _dexRouter);
    }

    // ============ DCA Orders ============

    function createDCAOrder(
        address _tokenIn,
        address _tokenOut,
        uint256 _totalAmount,
        uint256 _intervals,
        uint256 _intervalDuration,
        uint256 _minAmountOutPerInterval
    ) external payable nonReentrant returns (uint256 orderId) {
        require(_intervals > 0 && _intervals <= 365, "Invalid intervals");
        require(_intervalDuration >= 1 hours, "Interval too short");
        
        uint256 amountPerInterval = _totalAmount / _intervals;
        require(amountPerInterval > 0, "Amount too small");

        if (_tokenIn == address(0)) {
            require(msg.value >= _totalAmount, "Insufficient ETH");
        } else {
            IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _totalAmount);
        }

        orderId = dcaOrderCount++;
        dcaOrders[orderId] = DCAOrder({
            user: msg.sender,
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            amountPerInterval: amountPerInterval,
            intervalsRemaining: _intervals,
            intervalDuration: _intervalDuration,
            lastExecutionTime: block.timestamp,
            minAmountOut: _minAmountOutPerInterval,
            active: true
        });

        userDCAOrders[msg.sender].push(orderId);

        emit DCAOrderCreated(orderId, msg.sender, _tokenIn, _tokenOut);
    }

    function executeDCAOrder(
        uint256 _orderId,
        address _dexRouter,
        bytes calldata _swapData
    ) external onlyKeeper nonReentrant {
        DCAOrder storage order = dcaOrders[_orderId];
        require(order.active, "Order not active");
        require(order.intervalsRemaining > 0, "No intervals left");
        require(
            block.timestamp >= order.lastExecutionTime + order.intervalDuration,
            "Too early"
        );
        require(isDexRouter[_dexRouter], "Invalid DEX");

        uint256 feeAmount = (order.amountPerInterval * automationFee) / FEE_DENOMINATOR;
        uint256 amountAfterFee = order.amountPerInterval - feeAmount;

        if (order.tokenIn == address(0)) {
            collectedFeesETH += feeAmount;
        } else {
            collectedFeesToken[order.tokenIn] += feeAmount;
            IERC20(order.tokenIn).approve(_dexRouter, amountAfterFee);
        }

        uint256 balanceBefore = order.tokenOut == address(0)
            ? address(this).balance
            : IERC20(order.tokenOut).balanceOf(address(this));

        if (order.tokenIn == address(0)) {
            (bool success, ) = _dexRouter.call{value: amountAfterFee}(_swapData);
            require(success, "Swap failed");
        } else {
            (bool success, ) = _dexRouter.call(_swapData);
            require(success, "Swap failed");
        }

        uint256 balanceAfter = order.tokenOut == address(0)
            ? address(this).balance
            : IERC20(order.tokenOut).balanceOf(address(this));

        uint256 amountOut = balanceAfter - balanceBefore;
        require(amountOut >= order.minAmountOut, "Slippage too high");

        // Transfer to user
        if (order.tokenOut == address(0)) {
            (bool success, ) = order.user.call{value: amountOut}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(order.tokenOut).safeTransfer(order.user, amountOut);
        }

        order.intervalsRemaining--;
        order.lastExecutionTime = block.timestamp;

        if (order.intervalsRemaining == 0) {
            order.active = false;
        }

        emit DCAOrderExecuted(_orderId, order.amountPerInterval, amountOut);
    }

    function cancelDCAOrder(uint256 _orderId) external nonReentrant {
        DCAOrder storage order = dcaOrders[_orderId];
        require(order.user == msg.sender, "Not owner");
        require(order.active, "Not active");

        order.active = false;
        
        uint256 refundAmount = order.amountPerInterval * order.intervalsRemaining;
        
        if (order.tokenIn == address(0)) {
            (bool success, ) = msg.sender.call{value: refundAmount}("");
            require(success, "ETH refund failed");
        } else {
            IERC20(order.tokenIn).safeTransfer(msg.sender, refundAmount);
        }

        emit DCAOrderCancelled(_orderId);
    }

    // ============ Limit Orders ============

    function createLimitOrder(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _targetPrice,
        uint256 _minAmountOut,
        uint256 _duration
    ) external payable nonReentrant returns (uint256 orderId) {
        require(_duration >= 1 hours && _duration <= 30 days, "Invalid duration");
        require(_amountIn > 0, "Zero amount");

        if (_tokenIn == address(0)) {
            require(msg.value >= _amountIn, "Insufficient ETH");
        } else {
            IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
        }

        orderId = limitOrderCount++;
        limitOrders[orderId] = LimitOrder({
            user: msg.sender,
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            amountIn: _amountIn,
            targetPrice: _targetPrice,
            minAmountOut: _minAmountOut,
            expiry: block.timestamp + _duration,
            active: true
        });

        userLimitOrders[msg.sender].push(orderId);

        emit LimitOrderCreated(orderId, msg.sender, _targetPrice);
    }

    function executeLimitOrder(
        uint256 _orderId,
        address _dexRouter,
        bytes calldata _swapData,
        uint256 _currentPrice
    ) external onlyKeeper nonReentrant {
        LimitOrder storage order = limitOrders[_orderId];
        require(order.active, "Not active");
        require(block.timestamp < order.expiry, "Expired");
        require(_currentPrice >= order.targetPrice, "Price not reached");
        require(isDexRouter[_dexRouter], "Invalid DEX");

        order.active = false;

        uint256 feeAmount = (order.amountIn * automationFee) / FEE_DENOMINATOR;
        uint256 amountAfterFee = order.amountIn - feeAmount;

        if (order.tokenIn == address(0)) {
            collectedFeesETH += feeAmount;
        } else {
            collectedFeesToken[order.tokenIn] += feeAmount;
            IERC20(order.tokenIn).approve(_dexRouter, amountAfterFee);
        }

        uint256 balanceBefore = order.tokenOut == address(0)
            ? address(this).balance
            : IERC20(order.tokenOut).balanceOf(address(this));

        if (order.tokenIn == address(0)) {
            (bool success, ) = _dexRouter.call{value: amountAfterFee}(_swapData);
            require(success, "Swap failed");
        } else {
            (bool success, ) = _dexRouter.call(_swapData);
            require(success, "Swap failed");
        }

        uint256 balanceAfter = order.tokenOut == address(0)
            ? address(this).balance
            : IERC20(order.tokenOut).balanceOf(address(this));

        uint256 amountOut = balanceAfter - balanceBefore;
        require(amountOut >= order.minAmountOut, "Slippage too high");

        if (order.tokenOut == address(0)) {
            (bool success, ) = order.user.call{value: amountOut}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(order.tokenOut).safeTransfer(order.user, amountOut);
        }

        emit LimitOrderExecuted(_orderId, order.amountIn, amountOut);
    }

    function cancelLimitOrder(uint256 _orderId) external nonReentrant {
        LimitOrder storage order = limitOrders[_orderId];
        require(order.user == msg.sender, "Not owner");
        require(order.active, "Not active");

        order.active = false;

        if (order.tokenIn == address(0)) {
            (bool success, ) = msg.sender.call{value: order.amountIn}("");
            require(success, "ETH refund failed");
        } else {
            IERC20(order.tokenIn).safeTransfer(msg.sender, order.amountIn);
        }

        emit LimitOrderCancelled(_orderId);
    }

    // ============ Stop Loss Orders ============

    function createStopLossOrder(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _stopPrice,
        uint256 _minAmountOut,
        uint256 _duration
    ) external payable nonReentrant returns (uint256 orderId) {
        require(_duration >= 1 hours && _duration <= 30 days, "Invalid duration");
        require(_amountIn > 0, "Zero amount");

        if (_tokenIn == address(0)) {
            require(msg.value >= _amountIn, "Insufficient ETH");
        } else {
            IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), _amountIn);
        }

        orderId = stopLossOrderCount++;
        stopLossOrders[orderId] = StopLossOrder({
            user: msg.sender,
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            amountIn: _amountIn,
            stopPrice: _stopPrice,
            minAmountOut: _minAmountOut,
            expiry: block.timestamp + _duration,
            active: true
        });

        userStopLossOrders[msg.sender].push(orderId);

        emit StopLossOrderCreated(orderId, msg.sender, _stopPrice);
    }

    function executeStopLossOrder(
        uint256 _orderId,
        address _dexRouter,
        bytes calldata _swapData,
        uint256 _currentPrice
    ) external onlyKeeper nonReentrant {
        StopLossOrder storage order = stopLossOrders[_orderId];
        require(order.active, "Not active");
        require(block.timestamp < order.expiry, "Expired");
        require(_currentPrice <= order.stopPrice, "Price not triggered");
        require(isDexRouter[_dexRouter], "Invalid DEX");

        order.active = false;

        uint256 feeAmount = (order.amountIn * automationFee) / FEE_DENOMINATOR;
        uint256 amountAfterFee = order.amountIn - feeAmount;

        if (order.tokenIn == address(0)) {
            collectedFeesETH += feeAmount;
        } else {
            collectedFeesToken[order.tokenIn] += feeAmount;
            IERC20(order.tokenIn).approve(_dexRouter, amountAfterFee);
        }

        uint256 balanceBefore = order.tokenOut == address(0)
            ? address(this).balance
            : IERC20(order.tokenOut).balanceOf(address(this));

        if (order.tokenIn == address(0)) {
            (bool success, ) = _dexRouter.call{value: amountAfterFee}(_swapData);
            require(success, "Swap failed");
        } else {
            (bool success, ) = _dexRouter.call(_swapData);
            require(success, "Swap failed");
        }

        uint256 balanceAfter = order.tokenOut == address(0)
            ? address(this).balance
            : IERC20(order.tokenOut).balanceOf(address(this));

        uint256 amountOut = balanceAfter - balanceBefore;
        require(amountOut >= order.minAmountOut, "Slippage too high");

        if (order.tokenOut == address(0)) {
            (bool success, ) = order.user.call{value: amountOut}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(order.tokenOut).safeTransfer(order.user, amountOut);
        }

        emit StopLossOrderExecuted(_orderId, order.amountIn, amountOut);
    }

    function cancelStopLossOrder(uint256 _orderId) external nonReentrant {
        StopLossOrder storage order = stopLossOrders[_orderId];
        require(order.user == msg.sender, "Not owner");
        require(order.active, "Not active");

        order.active = false;

        if (order.tokenIn == address(0)) {
            (bool success, ) = msg.sender.call{value: order.amountIn}("");
            require(success, "ETH refund failed");
        } else {
            IERC20(order.tokenIn).safeTransfer(msg.sender, order.amountIn);
        }

        emit StopLossOrderCancelled(_orderId);
    }

    // ============ View Functions ============

    function getUserDCAOrders(address _user) external view returns (uint256[] memory) {
        return userDCAOrders[_user];
    }

    function getUserLimitOrders(address _user) external view returns (uint256[] memory) {
        return userLimitOrders[_user];
    }

    function getUserStopLossOrders(address _user) external view returns (uint256[] memory) {
        return userStopLossOrders[_user];
    }

    function getActiveDCAOrders(address _user) external view returns (DCAOrder[] memory) {
        uint256[] memory orderIds = userDCAOrders[_user];
        uint256 activeCount = 0;
        
        for (uint i = 0; i < orderIds.length; i++) {
            if (dcaOrders[orderIds[i]].active) activeCount++;
        }
        
        DCAOrder[] memory activeOrders = new DCAOrder[](activeCount);
        uint256 index = 0;
        
        for (uint i = 0; i < orderIds.length; i++) {
            if (dcaOrders[orderIds[i]].active) {
                activeOrders[index++] = dcaOrders[orderIds[i]];
            }
        }
        
        return activeOrders;
    }

    // ============ Admin Functions ============

    function setSwapFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_FEE, "Fee too high");
        swapFee = _fee;
    }

    function setAutomationFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_FEE, "Fee too high");
        automationFee = _fee;
    }

    function setKeeper(address _keeper, bool _status) external onlyOwner {
        isKeeper[_keeper] = _status;
        emit KeeperUpdated(_keeper, _status);
    }

    function withdrawFees(address _token) external onlyOwner {
        if (_token == address(0)) {
            uint256 amount = collectedFeesETH;
            collectedFeesETH = 0;
            (bool success, ) = owner().call{value: amount}("");
            require(success, "ETH withdraw failed");
            emit FeesCollected(_token, amount);
        } else {
            uint256 amount = collectedFeesToken[_token];
            collectedFeesToken[_token] = 0;
            IERC20(_token).safeTransfer(owner(), amount);
            emit FeesCollected(_token, amount);
        }
    }

    // ============ Receive ETH ============

    receive() external payable {}
}
