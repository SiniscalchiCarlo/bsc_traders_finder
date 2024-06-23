export interface DataWrapper {
    data: Data[];
}

export interface Data {
    'state': 0 | 1 | 2;
    'address': string;
    'capital': number[];
    'perc_gains': number[];
    'wins_percentage': number;
    'avg_perc_gain': number;
    'avg_ntrades_per_token': number;
}