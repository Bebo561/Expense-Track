//Here is the Graphs Page for the ExpenseTracking App

//Here are all of the necessary imports for the page
import {Chart as ChartJS, defaults, LinearScale, Title, Legend, DoughnutController, BarController} from 'chart.js/auto';
import {Bar, Pie, Line } from 'react-chartjs-2';
import './Styles/GraphsPage.css';
import Navbar from './Navbar';
import {useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";

//Here we are adding the necessary controllers for each chart type
ChartJS.register(LinearScale, Title, Legend, DoughnutController, BarController);

//Here are the defaults from the chartjs library that provides styling formats for the graphs
defaults.maintainAspectRatio = false;
defaults.responsive = true;
defaults.plugins.title.display = true;
defaults.plugins.title.align = "center";
(defaults.plugins as any).title.font.size = 20;
defaults.plugins.title.color = "black";

// Here is the Graphs Page Component
export default function GraphsPage() {
  const nav = useNavigate();
  //Used to authenticate if the user is logged in before making any api request
  const auth = getAuth();
  const user = auth.currentUser;

  if(!user){
      nav("/Login")
  }

  //Here are all of the variables that will be used to get data from the backend
  const currentDate = new Date();
  const currMonth = currentDate.getMonth() + 1;
  const currYear = currentDate.getFullYear();
  const Token = useSelector((state : any) => state.auth.token);
  const userID = useSelector((state : any) => state.auth.uid);
  const barUrl = "https://expensetrackserver-1ca84aedde02.herokuapp.com/GetBarGraph";
  const lineUrl = "https://expensetrackserver-1ca84aedde02.herokuapp.com/GetLineGraph";
  const pieUrl = "https://expensetrackserver-1ca84aedde02.herokuapp.com/GetPieChart";
  var [barData, setBarData] = useState([]);
  var [lineData, setLineData] = useState([]);
  var [pieData, setPieData] = useState([]);

  const barQueryParams = {
    UserID: userID,
    Month: currMonth
  }

  const lineQueryParams = {
    UserID: userID,
    Year: currYear
  }

  const pieQueryParams = {
    UserID: userID,
    Month: currMonth
  }

  console.log(Token);
  
  useEffect(() => {
    //API calls go here
    axios.get(barUrl, {params: barQueryParams, headers: {Authorization: Token }}).then((response) =>{
      console.log(response);
      setBarData(response.data.GraphData)
     }).catch((error) =>{
      console.log(error)
     });

    axios.get(lineUrl, {params: lineQueryParams, headers: {Authorization: Token }}).then((response) =>{
      console.log(response);
      setLineData(response.data.GraphData)
     }).catch((error) =>{
      console.log(error)
     });

    axios.get(pieUrl, {params: pieQueryParams, headers: {Authorization: Token }}).then((response) =>{
      console.log(response);
      setPieData(response.data.GraphData)
     }).catch((error) =>{
      console.log(error)
     });
  }, []);

  return(
    <div>
      <Navbar />
      <div className="GraphsPageWrapper">
        <div className="GraphsPage">
          <div className="dataCard data1">
            <Line
              data={{
                labels: lineData.map((data : any) => data.label),
                datasets: [
                  {
                    label: "Expenses Per Month",
                    data: lineData.map((data : any) => data.cost),
                    backgroundColor: "#006665",
                    borderColor: "#006665",
                  },
                ],
              }}
              options={{
                elements: {
                  line: {
                    tension: 0.5,
                  },
                },
                plugins: {
                  title: {
                    text:"Total Expenses for each Month",
                  },
                },
              }}
            />
          </div>

          <div className="dataCard data2">
            <Bar
              data={{
                labels: barData.map((data : any) => data.label),
                datasets: [
                  {
                    label: "Total Expenses for Each",
                    data: barData.map((data : any) => data.value),
                    backgroundColor: [
                      "rgba(43, 63, 229, 0.8)",
                      "rgba(250, 192, 19, 0.8)",
                      "rgba(253, 135, 135, 0.8)",
                      "rgba(0, 204, 204, 0.8)",
                      "rgba(51, 255, 153, 0.8)",
                      "rgba(0, 153, 153, 0.8)",
                      "rgba(255, 0, 0, 0.8)",
                      "rgba(0, 255, 0, 0.8)",
                      "rgba(0, 0, 153, 0.8)",
                    ],
                    borderRadius: 5,
                  },
                ],
              }}
              options={{
                plugins: {
                  title: {
                    text:"Expense Type Total",
                  },
                },
              }}
            />
          </div>

          <div className="dataCard data3">
            <Pie
              data={{
                labels: pieData.map((data : any) => data.label),
                datasets: [
                  {
                    label: "Count",
                    data: pieData.map((data : any) => data.value),
                    backgroundColor: [
                      "rgba(43, 63, 229, 0.8)",
                      "rgba(250, 192, 19, 0.8)",
                      "rgba(253, 135, 135, 0.8)",
                      "rgba(0, 204, 204, 0.8)",
                      "rgba(51, 255, 153, 0.8)",
                      "rgba(0, 153, 153, 0.8)",
                      "rgba(255, 0, 0, 0.8)",
                      "rgba(0, 255, 0, 0.8)",
                      "rgba(0, 0, 153, 0.8)",
                    ],
                    borderColor: [
                      "rgba(43, 63, 229, 0.8)",
                      "rgba(250, 192, 19, 0.8)",
                      "rgba(253, 135, 135, 0.8)",
                      "rgba(0, 204, 204, 0.8)",
                      "rgba(51, 255, 153, 0.8)",
                      "rgba(0, 153, 153, 0.8)",
                      "rgba(255, 0, 0, 0.8)",
                      "rgba(0, 255, 0, 0.8)",
                      "rgba(0, 0, 153, 0.8)",
                    ],
                  },
                ],
              }}
              options={{
                type: 'doughnut',
                plugins: {
                  title: {
                    text: "Percentage of Total Expenses",
                  },
                  legend: {
                    display: true,
                    position: 'right',
                    labels: {
                      generateLabels: function (chart: any) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                          return data.labels.map((label: string, i: number) => {
                            const ds = data.datasets[0];
                            const value = ds.data[i];
                            const total = ds.data.reduce((acc: number, val: number) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(2) + '%';
                            return {
                              text: `${label}: ${percentage}`,
                              fillStyle: ds.backgroundColor[i],
                              strokeStyle: ds.borderColor[i],
                              lineWidth: ds.borderWidth,
                              hidden: isNaN(ds.data[i]),
                              index: i,
                            };
                          });
                        }
                        return [];
                      },
                    },
                  },
                  tooltips: {
                    callbacks: {
                      label: function (tooltipItem: any, data: any) {
                        const dataset = data.datasets[tooltipItem.datasetIndex];
                        const total = dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                        const value = dataset.data[tooltipItem.index];
                        const percentage = ((value / total) * 100).toFixed(2) + '%';
                        return `${data.labels[tooltipItem.index]}: ${value} (${percentage})`;
                      },
                    },
                  },
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

