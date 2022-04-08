require('dotenv').config();
const ethers = require('ethers');  
const { ChainId, Fetcher, Pair, WETH, Token, Route, Trade, TradeType, TokenAmount } = require ('@uniswap/sdk');

const provider = new ethers.providers.InfuraProvider('homestead', process.env.API_KEY);

const init = async () => {
	const separator = () => console.log('--------------------------------------------------')

	// get Token USDT
	const USDT = await Fetcher.fetchTokenData(ChainId.MAINNET, "0xdAC17F958D2ee523a2206206994597C13D831ec7", provider);

	// get address of pair
	const pairAddress = Pair.getAddress(USDT, WETH[USDT.chainId]);
	console.log('Address of WETH/USDT:', pairAddress);

	// get Pair WETH/USDT
	const pair = await Fetcher.fetchPairData(USDT, WETH[USDT.chainId], provider);

	// get reserve USDT
	const reserve = pair.reserveOf(USDT).toExact()
	console.log('Reserve:', reserve);
	
	separator();

	// set Route
	const route = new Route([pair], WETH[USDT.chainId]);
	console.log('Current mid price USDT -> WETH', route.midPrice.toFixed(0));
	console.log('Current mid price WETH -> USDT', route.midPrice.invert().toSignificant());

	separator();

	// set TokenAmount
	const amountWETH = new TokenAmount(WETH[USDT.chainId], "1000000000000000000")

	// set Trade
	const trade = new Trade(
		route,
		amountWETH,
		TradeType.EXACT_INPUT
	);
	console.log('WETH amount:', trade.inputAmount.toSignificant(6))
	console.log('WETH execution price:', trade.executionPrice.toSignificant(6))
	console.log('WETH next mid price:', trade.nextMidPrice.toSignificant(6))

	separator();

	// set new Tokens
	const FXS = new Token(ChainId.MAINNET, '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', 6);
	const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6);
	
	// set new Pairs
	const USDC_TO_USDT = await Fetcher.fetchPairData(USDC, USDT, provider);
	const USDT_TO_FXS = await Fetcher.fetchPairData(USDT, FXS, provider);	
	const FXS_TO_WETH = await Fetcher.fetchPairData(FXS, WETH[USDT.chainId], provider);

	// set new Routes and get prices
	const longRoute1 = new Route([FXS_TO_WETH, USDT_TO_FXS], WETH[USDT.chainId]);
	console.log('Mid price USDT -> FXS -> WETH', longRoute1.midPrice.toSignificant(6));
	const longRoute2 = new Route([FXS_TO_WETH, USDT_TO_FXS, USDC_TO_USDT], WETH[USDT.chainId]);
	console.log('Mid price USDC -> USDT -> FXS -> WETH', longRoute2.midPrice.toSignificant(6));
}

init();