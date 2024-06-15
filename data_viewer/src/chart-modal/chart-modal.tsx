import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Trader } from "../types/trader.interface";
import './chart-modal.css';

interface ChartModalProps {
  data: Trader;
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
                  <Tooltip />
                  <Line
                    dataKey="capital_part"
                    stroke="black"
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