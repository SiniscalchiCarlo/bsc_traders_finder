import './App.css';
import Form from 'react-bootstrap/Form';
import React, { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Data, DataWrapper } from './types/trader.interface';
import ChartModal from './chart-modal/chart-modal';
import { deleteData, getData } from './api/data';

export default function App() {

  const [data, setData] = useState<DataWrapper>({
    data: []
  });

  const columns: ((keyof Data) | 'open-chart' | 'delete')[] = ["address", "wins_percentage", "avg_perc_gain", "avg_ntrades_per_token", "capital", 'open-chart', 'delete'];

  const [orderBy, setOrderBy] = React.useState<string>(columns[0]);

  const [orderDirection, setOrderDirection] = React.useState<string>("asc");

  const [selectedTrader, setSelectedTrader] = useState<Data | undefined>(undefined);

  const onChangeOrder = (e: any) => {
    setOrderBy(e.target.value);
  };

  const onChangeOrderDirection = (e: any) => {
    setOrderDirection(e.target.value);
  };

  useEffect(() => {
    updateData();
  }, []);

  const updateData = () => {
    getData().then((data: DataWrapper) => {
      setData(data);
    });
  }

  const onDeleteAddress = (data: Data) => {
    deleteData(data).then(() => {
      updateData();
    });
  }

  return (
    <>
      <div className="controls-row">
        <div>
          <p>Order by</p>
          <Form.Select onChange={onChangeOrder} className="form-select">
            {columns.map((column: string) => <option>{column}</option>)}
          </Form.Select>
        </div>

        <div>
          <p>Order direction</p>
          <Form.Select onChange={onChangeOrderDirection} className="form-select">
            <option>asc</option>
            <option>desc</option>
          </Form.Select>
        </div>
      </div>

      <table>
        <thead className="table-header">
          <tr>
            {columns.map((column: string) => <th>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {
            data.data
              .filter((data: Data) => data.state === 0)
              .sort((a: any, b: any) => (a[orderBy] > b[orderBy]) ? -1 * (orderDirection === 'asc' ? 1 : -1) : 1 * (orderDirection === 'asc' ? 1 : -1))
              .reverse()
              .map((row: Data) => {
                return (
                  <tr className="table-row">
                    {
                      columns.map((column: string) => {
                        if(column === 'capital') {
                          return (
                            <td>
                              <div style={{ width: '100px'}}>
                                <ResponsiveContainer width='100%' height='100%' aspect={4}>
                                  <LineChart data={row.capital.map((value: number) => {
                                    return {
                                      'capital_part' : value,
                                    }
                                  })}>
                                      {/* <CartesianGrid />
                                      <XAxis dataKey="name" interval={"preserveStartEnd"} />
                                      <YAxis></YAxis>
                                      <Legend />
                                      <Tooltip /> */}
                                      <Line
                                        dataKey="capital_part"
                                        stroke="yellow"
                                        activeDot={{ r: 8 }}
                                        dot={false}
                                      />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </td>
                          );
                        }
                        else if(column === 'open-chart') {
                          return (
                            <td>
                              <button 
                                className='default-button'
                                onClick={() => setSelectedTrader(row)}
                              >Open chart</button>
                            </td>
                          );
                        }
                        else if(column === 'delete') {
                          return (
                            <td>
                              <button 
                                className='default-button delete-button'
                                onClick={() => onDeleteAddress(row)}
                              >Delete</button>
                            </td>
                          );
                        }
                        else {
                          return <td>{(row as any)[column]}</td>;
                        }
                      })
                    }
                  </tr>
                );
              })
          }
        </tbody>
      </table>

      {
        selectedTrader && <ChartModal data={selectedTrader} closeModal={() => setSelectedTrader(undefined)}></ChartModal>
      }
    </>
  );
}