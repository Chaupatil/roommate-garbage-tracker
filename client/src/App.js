import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import { motion } from "framer-motion";

const ROOMMATES = ["Chummi", "Pragu", "Punya", "Racchu"];
const API_URL = "https://roommate-garbage-tracker.onrender.com/api/garbageData";

const roommateColors = {
  Chummi: "#FF6B6B",
  Pragu: "#4ECDC4",
  Punya: "#45B7D1",
  Racchu: "#FFA07A",
};

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [garbageData, setGarbageData] = useState({});
  const [selectedRoommate, setSelectedRoommate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setGarbageData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const saveData = async (newData) => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });
      setGarbageData(newData);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedRoommate) {
      handleRoommateClick(selectedRoommate, date);
    }
  };

  const handleRoommateClick = async (roommate, date = selectedDate) => {
    setSelectedRoommate(roommate === selectedRoommate ? null : roommate);

    const istOffset = 5.5 * 60;
    const localDate = new Date(date.getTime() + istOffset * 60 * 1000);
    const dateString = localDate.toISOString().split("T")[0];

    const newData = { ...garbageData };

    if (newData[dateString] && newData[dateString][roommate]) {
      delete newData[dateString][roommate];
      if (Object.keys(newData[dateString]).length === 0) {
        delete newData[dateString];
      }
    } else {
      if (!newData[dateString]) {
        newData[dateString] = {};
      }
      newData[dateString][roommate] = true;
    }

    try {
      await saveData(newData);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const getMonthlyData = (roommate) => {
    const monthlyData = {};
    Object.entries(garbageData).forEach(([date, data]) => {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;

      if (data[roommate]) {
        if (!monthlyData[year]) {
          monthlyData[year] = {};
        }
        if (!monthlyData[year][month]) {
          monthlyData[year][month] = { days: [], count: 0 };
        }
        monthlyData[year][month].days.push(dateObj.getDate());
        monthlyData[year][month].count++;
      }
    });

    Object.values(monthlyData).forEach((yearData) =>
      Object.values(yearData).forEach((monthData) =>
        monthData.days.sort((a, b) => a - b)
      )
    );

    return monthlyData;
  };

  return (
    <div className="App">
      <motion.h1
        className="app-title"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Roommate Garbage Tracker
      </motion.h1>
      <motion.div
        className="calendar-wrapper"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileClassName={({ date }) => {
              const localDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
              const dateString = localDate.toISOString().split("T")[0];
              return garbageData[dateString] ? "marked-date" : "";
            }}
            tileContent={({ date }) => {
              const localDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
              const dateString = localDate.toISOString().split("T")[0];
              if (garbageData[dateString]) {
                return (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {Object.keys(garbageData[dateString]).map((roommate) => (
                      <div
                        key={roommate}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: roommateColors[roommate],
                          margin: "0 2px",
                        }}
                      />
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
        </div>
      </motion.div>
      <div className="button-container">
        {ROOMMATES.map((roommate) => (
          <motion.button
            key={roommate}
            className={`roommate-button ${
              selectedRoommate === roommate ? "selected" : ""
            }`}
            style={{
              backgroundColor: roommateColors[roommate],
              color: "#fff",
            }}
            onClick={() => handleRoommateClick(roommate)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {roommate}
          </motion.button>
        ))}
      </div>
      <motion.div
        className="counts-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {ROOMMATES.map((roommate) => {
          const monthlyData = getMonthlyData(roommate);
          return (
            <motion.div
              key={roommate}
              className="roommate-card"
              style={{ borderTop: `5px solid ${roommateColors[roommate]}` }}
              whileHover={{ y: -5 }}
            >
              <h2
                className="roommate-name"
                style={{ color: roommateColors[roommate] }}
              >
                {roommate}
              </h2>
              {Object.entries(monthlyData).map(([year, months]) => (
                <div key={year}>
                  <h3>{year}</h3>
                  {Object.entries(months).map(([month, data]) => (
                    <div key={month} className="month-section">
                      <p className="month-title">
                        {new Date(year, month - 1).toLocaleString("default", {
                          month: "long",
                        })}{" "}
                        (Total: {data.count})
                      </p>
                      <p className="month-days">{data.days.join(", ")}</p>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default App;
