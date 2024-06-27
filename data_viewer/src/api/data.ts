import { Data, DataWrapper } from "../types/trader.interface";

export const getData = async () =>{
    const response = await fetch('http://192.168.178.30:443/data');
    const data = await response.json()
    return data as DataWrapper;
}

export const deleteData = async (_data: Data) =>{
    const response = await fetch(
        `http://192.168.178.30:443/delete?address=${_data.address}`,
        {
            method: 'post'
        }
    );
    const data = await response.json()
    return data as DataWrapper;
}

export const includeData = async (_data: Data) =>{
    const response = await fetch(
        `http://192.168.178.30:443/include?address=${_data.address}`,
        {
            method: 'post'
        }
    );
    const data = await response.json()
    return data as DataWrapper;
}

export const saveData = async (_data: Data) =>{
    const response = await fetch(
        `http://192.168.178.30:443/save?address=${_data.address}`,
        {
            method: 'post'
        }
    );
    const data = await response.json()
    return data as DataWrapper;
}