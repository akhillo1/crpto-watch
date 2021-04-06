export default class Subscriptionpair {
    coin: string;
    currency: string;
    market: string;
    id: string;
    constructor (coin: string, currency: string, market: string) {
        this.coin = coin;
        this.currency = currency;
        this.market = market;
        this.id = `2~${market}~${coin}~${currency}`
    }   
}
