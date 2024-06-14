import './App.css';
import Form from 'react-bootstrap/Form';
import React from 'react';
import json from './data.json';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function App() {

  const data = json.data;

  const columns: string[] = ["ID", "Trader", "Result", "Value", "chart"];

  const [orderBy, setOrderBy] = React.useState<string>(columns[0]);

  const [orderDirection, setOrderDirection] = React.useState<string>("asc");

  const onChangeOrder = (e: any) => {
    setOrderBy(e.target.value);
  };

  const onChangeOrderDirection = (e: any) => {
    setOrderDirection(e.target.value);
  };

  // Sample chart data
  const pdata = [
    {
        name: "MongoDb",
        student: 11,
    },
    {
        name: "Javascript",
        student: 15,
    },
    {
        name: "PHP",
        student: 5,
    },
    {
        name: "Java",
        student: 10,
    },
    {
        name: "C#",
        student: 9,
    },
    {
        name: "C++",
        student: 10,
    },
  ];


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
            data
              .sort((a: any, b: any) => (a[orderBy] > b[orderBy]) ? -1 * (orderDirection === 'asc' ? 1 : -1) : 1 * (orderDirection === 'asc' ? 1 : -1))
              .reverse()
              .map((row: any) => {
                return (
                  <tr className="table-row">
                    {
                      columns.map((column: string) => {
                        if(column === 'chart') {
                          return (
                            <td>
                              <div style={{ width: '100px'}}>
                                <ResponsiveContainer width='100%' height='100%' aspect={4}>
                                  <LineChart data={pdata}>
                                      {/* <CartesianGrid />
                                      <XAxis dataKey="name" interval={"preserveStartEnd"} />
                                      <YAxis></YAxis>
                                      <Legend />
                                      <Tooltip /> */}
                                      <Line
                                        dataKey="student"
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
                        else {
                          return <td>{row[column]}</td>;
                        }
                      })
                    }
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    </>
  );
}