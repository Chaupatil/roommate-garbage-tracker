import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import {
  Container,
  Button,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

const ROOMMATES = ["Chummi", "Pragu", "Punya", "Racchu"];
const API_URL = "https://roommate-garbage-tracker.onrender.com/api/garbageData";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [garbageData, setGarbageData] = useState({});
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [roommateColors] = useState({
    Chummi: "#FFC107",
    Pragu: "#8BC34A",
    Punya: "#03A9F4",
    Racchu: "#E91E63",
  });

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
  };

  const handleRoommateClick = async (roommate) => {
    setSelectedRoommate(roommate);

    // Adjust the date to IST (UTC+5:30)
    const istOffset = 5.5 * 60; // Offset in minutes
    const localDate = new Date(selectedDate.getTime() + istOffset * 60 * 1000);

    // Format the date as YYYY-MM-DD
    const dateString = localDate.toISOString().split("T")[0];

    const newData = { ...garbageData };

    // Toggle the date for the roommate
    if (newData[dateString] && newData[dateString][roommate]) {
      // If the date is already selected, unselect it (remove it)
      delete newData[dateString][roommate];
      // If the date has no other roommate data, delete the date entry
      if (Object.keys(newData[dateString]).length === 0) {
        delete newData[dateString];
      }
    } else {
      // If the date is not selected, add it
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
      const month = dateObj.getMonth() + 1; // Months are 0-based

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

    // Sort days within each month
    Object.values(monthlyData).forEach((yearData) =>
      Object.values(yearData).forEach((monthData) =>
        monthData.days.sort((a, b) => a - b)
      )
    );

    return monthlyData;
  };

  return (
    <Container maxWidth="lg" className="App">
      <Typography variant="h3" gutterBottom>
        Roommate Garbage Tracker
      </Typography>
      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={({ date }) => {
            const localDate = new Date(
              date.getTime() + 5.5 * 60 * 60 * 1000 // Adjust for IST offset
            );
            const dateString = localDate.toISOString().split("T")[0];
            if (
              selectedRoommate &&
              garbageData[dateString] &&
              garbageData[dateString][selectedRoommate]
            ) {
              return "marked-date";
            }
            return null;
          }}
          tileContent={({ date, view }) => {
            const dateString = new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0];
            if (
              selectedRoommate &&
              garbageData[dateString] &&
              garbageData[dateString][selectedRoommate]
            ) {
              return (
                <div
                  style={{
                    backgroundColor: roommateColors[selectedRoommate],
                    height: "100%",
                    width: "100%",
                    borderRadius: "50%",
                  }}
                />
              );
            }
            return null;
          }}
        />
      </div>
      <div className="button-container">
        {ROOMMATES.map((roommate) => (
          <Button
            key={roommate}
            variant="contained"
            style={{
              backgroundColor: roommateColors[roommate],
              color: selectedRoommate === roommate ? "#fff" : "#000",
              border:
                selectedRoommate === roommate
                  ? `2px solid ${roommateColors[roommate]}`
                  : "none",
            }}
            onClick={() => handleRoommateClick(roommate)}
          >
            {roommate}
          </Button>
        ))}
      </div>
      <div className="counts-container">
        {ROOMMATES.map((roommate) => {
          const monthlyData = getMonthlyData(roommate);
          return (
            <Card
              key={roommate}
              className="roommate-card"
              style={{ borderColor: roommateColors[roommate] }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  style={{ color: roommateColors[roommate] }}
                >
                  {roommate}
                </Typography>
                {Object.entries(monthlyData).map(([year, months]) => (
                  <div key={year}>
                    <Typography variant="h6">{year}</Typography>
                    {Object.entries(months).map(([month, data]) => (
                      <div key={month} className="month-section">
                        <Typography variant="subtitle1">
                          {new Date(year, month - 1).toLocaleString("default", {
                            month: "long",
                          })}{" "}
                          (Total: {data.count})
                        </Typography>
                        <Typography variant="body1">
                          {data.days.join(", ")}
                        </Typography>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}

export default App;
