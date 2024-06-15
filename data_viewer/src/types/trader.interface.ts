export interface Traders {
    data: Trader[];
}

export interface Trader {
    'address': string;
    'capital': number[];
    'perc_gains': number[];
    'wins_percentage': number;
    'avg_perc_gain': number;
    'avg_ntrades_per_token': number;
}