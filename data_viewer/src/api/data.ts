import { Data, DataWrapper } from "../types/trader.interface";

export const getData = async () =>{
    const response = await fetch('http://localhost:443/data');
    const data = await response.json()
    return data as DataWrapper;
}

export const deleteData = async (_data: Data) =>{
    const response = await fetch(
        `http://localhost:443/delete?address=${_data.address}`,
        {
            method: 'post'
        }
    );
    const data = await response.json()
    return data as DataWrapper;
}