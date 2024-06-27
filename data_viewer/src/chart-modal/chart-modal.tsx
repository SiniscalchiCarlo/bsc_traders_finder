import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { Data } from "../types/trader.interface";
import './chart-modal.css';

interface ChartModalProps {
  data: Data;
  closeModal: Function;
}

export default function ChartModal({
  data,
  closeModal
}: ChartModalProps) {
  return (
    <>
      <div className="overlay">
        <div className="modal">
          <div>
            <ResponsiveContainer width='100%' height='100%' aspect={2}>
              <LineChart data={data.capital.map((value: number) => {
                return {
                  'capital_part' : value,
                }
              })}>
                  <CartesianGrid />
                  {/* <XAxis dataKey="name" interval={"preserveStartEnd"} /> */}
                  <YAxis></YAxis>
                  <Legend />
                  <Tooltip contentStyle={{backgroundColor:'black'}}/>
                  <Line
                    dataKey="capital_part"
                    stroke="white"
                    activeDot={{ r: 8 }}
                    dot={false}
                  />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <button className="default-button" onClick={() => closeModal()}>Close chart</button>
        </div>
      </div>
    </>
  );
}