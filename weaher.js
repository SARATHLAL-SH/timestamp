const weatherIcon = document.querySelector(".weather-icon");

window.addEventListener("DOMContentLoaded", () => {
  const gmtOffsetSelect = document.getElementById("gmtOffset");
  const minOffset = -12;
  const maxOffset = 12;

  for (let offset = minOffset; offset <= maxOffset; offset++) {
    const option = document.createElement("option");
    const sign = offset >= 0 ? "+" : "-";
    const hour = Math.abs(offset);
    const offsetStr = `GMT${sign}${hour < 10 ? "0" : ""}${hour}00`;
    option.value = offset;
    option.textContent = offsetStr;
    gmtOffsetSelect.appendChild(option);
  }
});

async function convertToTimestamp() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  const gmtOffset = document.getElementById("gmtOffset").value;

  if (fromDate && toDate && gmtOffset !== null) {
    const fromTimestamp = convertDateTimeToTimestamp(fromDate, gmtOffset);
    const toTimestamp = convertDateTimeToTimestamp(toDate, gmtOffset);
    const wapiurl =
      "https://dashboard.arveair.com:3001/homeassistant/device/deviceStatus";
    const headers = {
      api_key: "73766064-1ded-4add-a72c-4c3596b64a10",
      devicesn: "A0120-0000-0000-1224",
      customerToken: "2a642e89-4cc2-4ce0-acdf-48f7c4b96161",
      from: fromTimestamp.toString(),
      to: toTimestamp.toString(),
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(wapiurl, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        console.log("response status");
        alert("Select Different TimeStamp");
      }

      const data = await response.json();

      console.log("data", JSON.stringify(data));

      const container = document.getElementById("dataContainer");
      container.innerHTML = "";
      function calculateAverage(values) {
        const sum = values.reduce((acc, value) => acc + value, 0);
        return (sum / values.length).toFixed(2);
      }
      // Function to convert timestamp to readable date
      function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
      }

      // Create a table for each data type
      for (const [key, values] of Object.entries(data.queryValues)) {
        const section = document.createElement("div");
        section.classList.add("data-section");

        const title = document.createElement("h3");
        title.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        section.appendChild(title);

        const table = document.createElement("table");
        table.classList.add("data-table");

        // Create table headers
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const thTimestamp = document.createElement("th");
        thTimestamp.textContent = "Timestamp";
        const thValue = document.createElement("th");
        thValue.textContent = "Value";
        headerRow.appendChild(thTimestamp);
        headerRow.appendChild(thValue);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement("tbody");
        for (let i = 0; i < values.length; i++) {
          const row = document.createElement("tr");
          const tdTimestamp = document.createElement("td");
          tdTimestamp.textContent = formatTimestamp(data.timestamps[i]);
          const tdValue = document.createElement("td");
          tdValue.textContent = values[i];
          row.appendChild(tdTimestamp);
          row.appendChild(tdValue);
          tbody.appendChild(row);
        }
        table.appendChild(tbody);

        section.appendChild(table);
        container.appendChild(section);
        const avgCO2 = calculateAverage(data.queryValues.co2);
        const avgHumidity = calculateAverage(data.queryValues.humidity);
        const avgTemperature = calculateAverage(data.queryValues.temperature);
        console.log("avg co2", avgTemperature);
        document.querySelector(".temp").innerHTML =
          Math.round(avgTemperature) + "°C";
        document.querySelector(".humidity").innerHTML = avgHumidity + "%";
        document.querySelector(".wind").innerHTML = avgCO2;

        if (avgTemperature > 26) {
          weatherIcon.src = "clear.png";
        }
        if (avgTemperature < 26 && avgTemperature > 20) {
          weatherIcon.src = "clouds.png";
        }
        if (avgTemperature < 20 && avgTemperature > -10) {
          weatherIcon.src = "mist.png";
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Try again...");
    }
  } else {
    alert("Please select both dates and a GMT offset.");
  }
}

function convertDateTimeToTimestamp(dateTime, gmtOffset) {
  // Create a new Date object from the datetime-local input value
  const date = new Date(dateTime);

  // Adjust the date object for the GMT offset
  const offsetHours = parseInt(gmtOffset);
  const adjustedDate = new Date(date.getTime() - offsetHours * 60 * 60 * 1000);

  // Return the Unix timestamp in milliseconds
  return adjustedDate.getTime();
}
