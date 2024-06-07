import { useEffect, useState } from "react";
import "./App.css";
import TimeSeriesChart from "./components/TimeSeriesChart";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { largeSampleData } from "./data/sampleData";

function App() {
  const [data, setData] = useLocalStorage("timeSeriesData", []);
  const [isLoading, setIsLoading] = useState(false); // State to handle loading more data
  const dataLimit = 20;

  // Fake API call to fetch latest data
  const fetchFakeAPIData = async (direction = "") => {
    // Simulate data fetching

    return new Promise((resolve) => {
      setTimeout(() => {
        const currentData = data;
        let newData = [];

        if (direction === "left") {
          console.log("Left");

          const currentDataStartIndexInLargeSample = largeSampleData.findIndex(
            (d) => d.date === currentData[0].date
          );

          if (currentDataStartIndexInLargeSample === 0) return;

          newData = largeSampleData.slice(
            Math.max(0, currentDataStartIndexInLargeSample - dataLimit),
            currentDataStartIndexInLargeSample
          );
        } else if (direction === "right") {
          console.log("Right");

          const currentDataEndIndexInLargeSample = largeSampleData.findIndex(
            (d) => d.date === currentData[currentData.length - 1].date
          );

          if (currentDataEndIndexInLargeSample === largeSampleData.length)
            return;

          newData = largeSampleData.slice(
            currentDataEndIndexInLargeSample + 1,
            Math.min(
              currentDataEndIndexInLargeSample + dataLimit,
              largeSampleData.length
            )
          );
        } else {
          newData = largeSampleData.slice(40, 71);
        }

        resolve(newData);
      }, 1000);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (data.length === 0) {
        const fetchedData = await fetchFakeAPIData();
        setData(fetchedData);
      }
    };

    fetchData();
  }, []);

  const handleRefreshData = async () => {
    const fetchedData = await fetchFakeAPIData();
    setData(fetchedData);
  };

  const handleFetchMoreData = async (direction) => {
    setIsLoading(true);
    const newData = await fetchFakeAPIData(direction);

    setTimeout(() => {
      setData((prevData) => {
        if (direction === "left") {
          return [...newData, ...prevData]; // Append new data to the beginning
        } else if (direction === "right") {
          return [...prevData, ...newData]; // Append new data to the end
        } else {
          return [newData];
        }
      });

      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <h2>Time Series Chart</h2>

        {isLoading && <p>More data is Fetching......</p>}
        <TimeSeriesChart
          width={500}
          height={400}
          data={data}
          onZoomEnd={handleFetchMoreData}
        />
        {data.length > 0 && (
          <button
            style={{
              cursor: "pointer",
              border: "1px solid lightGray",
              borderRadius: "5px",
              backgroundColor: "gray",
              color: "white",
              fontSize: "14px",
              padding: "10px",
            }}
            onClick={handleRefreshData}
          >
            Refresh Data
          </button>
        )}
      </div>
    </>
  );
}

export default App;
