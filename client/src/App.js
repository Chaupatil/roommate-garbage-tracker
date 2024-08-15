import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";
import {
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const ROOMMATES = ["Chummi", "Pragu", "Punya", "Racchu"];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const API_URL = "https://roommate-garbage-tracker.onrender.com/api/garbageData";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [garbageData, setGarbageData] = useState({});

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
    const dateString = selectedDate.toISOString().split("T")[0];
    const newData = { ...garbageData };
    if (!newData[dateString]) {
      newData[dateString] = {};
    }
    newData[dateString][roommate] = true;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      setGarbageData(newData);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const getMonthCounts = () => {
    const counts = {};
    ROOMMATES.forEach((roommate) => {
      counts[roommate] = new Array(12).fill(0);
    });

    Object.entries(garbageData).forEach(([date, roommateData]) => {
      const month = new Date(date).getMonth();
      Object.keys(roommateData).forEach((roommate) => {
        if (ROOMMATES.includes(roommate)) {
          counts[roommate][month]++;
        }
      });
    });

    return counts;
  };

  const getTotalCounts = (monthCounts) => {
    return MONTHS.map((_, index) =>
      ROOMMATES.reduce((sum, roommate) => sum + monthCounts[roommate][index], 0)
    );
  };

  const monthCounts = getMonthCounts();
  const totalCounts = getTotalCounts(monthCounts);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateString = date.toISOString().split("T")[0];
      return garbageData[dateString] ? "marked-date" : null;
    }
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
          tileClassName={tileClassName}
        />
      </div>
      <div className="button-container">
        {ROOMMATES.map((roommate) => (
          <Button
            key={roommate}
            variant="contained"
            onClick={() => handleRoommateClick(roommate)}
          >
            {roommate}
          </Button>
        ))}
      </div>
      <TableContainer component={Paper} className="counts-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Roommate</TableCell>
              {MONTHS.map((month) => (
                <TableCell key={month}>{month}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {ROOMMATES.map((roommate) => (
              <TableRow key={roommate}>
                <TableCell>{roommate}</TableCell>
                {MONTHS.map((_, index) => (
                  <TableCell key={index}>
                    {monthCounts[roommate][index]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <strong>Total</strong>
              </TableCell>
              {totalCounts.map((count, index) => (
                <TableCell key={index}>
                  <strong>{count}</strong>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;
