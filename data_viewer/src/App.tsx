import './App.css';
import Form from 'react-bootstrap/Form';
import React, { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Data, DataWrapper } from './types/trader.interface';
import ChartModal from './chart-modal/chart-modal';
import { deleteData, getData, includeData, saveData } from './api/data';

export default function App() {

  const [data, setData] = useState<DataWrapper>({
    data: []
  });

  const columns: ((keyof Data) | 'open-chart' | 'exclude' | 'save')[] = ["address", "wins_percentage", "avg_perc_gain", "avg_ntrades_per_token", "capital", 'open-chart', 'exclude','save'];

  const [orderBy, setOrderBy] = React.useState<string>(columns[0]);

  const [orderDirection, setOrderDirection] = React.useState<string>("asc");

  const [selectedTrader, setSelectedTrader] = useState<Data | undefined>(undefined);

  const [filter, setFilter] = React.useState<number>(0);

  const onChangeOrder = (e: any) => {
    setOrderBy(e.target.value);
  };

  const onChangeOrderDirection = (e: any) => {
    setOrderDirection(e.target.value);
  };

  const onChangeFilter = (e: any) => {
    setFilter(parseInt(e.target.value, 10));
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
    if(data.state === 2) {
      includeData(data).then(() => {
        updateData();
      });
    }
    else {
      deleteData(data).then(() => {
        updateData();
      });
    }
  }

  const onSaveAddress = (data: Data) => {
    if(data.state === 1) {
      includeData(data).then(() => {
        updateData();
      });
    }
    else {
      saveData(data).then((data: DataWrapper) => {
        updateData();
      });
    }
  }

  const filterData = (data: Data[]) => {
    if(filter === -1) return data;

    if(filter === 0) {
      return data.filter((data: Data) => data.state === 0 || data.state === 1);
    }
    else {
      return data.filter((data: Data) => data.state === 1);
    }
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

        <div>
          <p>Filter</p>
          <Form.Select onChange={onChangeFilter} className="form-select">
            <option value={0}>Default</option>
            <option value={1}>Only Favorites</option>
            <option value={-1}>View All</option>
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
            filterData(data.data)
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
                        else if(column === 'exclude') {
                          return (
                            <td>
                              <button 
                                className='default-button delete-button'
                                onClick={() => onDeleteAddress(row)}
                              >{row.state === 2 ? 'Include' : 'Exclude'}</button>
                            </td>
                          );
                        }
                        else if(column === 'save') {
                          return (
                            <td>
                              <button 
                                className='default-button favorite-button'
                                onClick={() => onSaveAddress(row)}
                              >{row.state === 1 ? 'Remove from favorites' : 'Add to favorites'}</button>
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