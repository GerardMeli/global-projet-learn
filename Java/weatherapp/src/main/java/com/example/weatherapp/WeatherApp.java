package com.example.weatherapp;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Scanner;
import org.json.JSONObject;

public class WeatherApp {

    private static final String API_KEY = "656ab14b2b5ed338e9b6d2a2d650910b";
    private static final String API_URL = "http://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric";

    Scanner scanner = new Scanner(System.in);

    public void run() {
        System.out.println("====================================");
        System.out.println("      WEATHER CONSOLE APP");
        System.out.println("====================================");

        while (true) {

            System.out.println("\nOptions: ");
            System.out.println("1. Get the weather by city name");
            System.out.println("2. Exit");
            System.out.print("Choose an option: ");
            String option = scanner.nextLine();

            switch (option) {
                case "1":
                    System.out.println("Enter the name of your city: ");
                    String city = scanner.nextLine().trim();

                    if (city.isEmpty()) {
                        System.out.println("City name cannot be empty. Please try again.");
                    } else {
                        getWeatherData(city);                        
                    }
                    break;

                case "2":
                    System.out.println("Exiting the application. Goodbye!");
                    scanner.close();
                    System.exit(0);
                    break;
            
                default:
                    System.out.println("Invalid option. Please try again.");
            }
            
        }
    }

    private void getWeatherData(String cityName) {
        try {
            String urlString = String.format(API_URL, cityName, API_KEY);
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = br.readLine()) != null) {
                    response.append(inputLine);
                }
                br.close();

                // Parse the JSON response
                JSONObject jsonResponse = new JSONObject(response.toString());
                displayWeatherData(jsonResponse, cityName);
            } else if (responseCode == HttpURLConnection.HTTP_NOT_FOUND) {
                System.out.println("City not found. Please check the city name and try again.");
            } else {
                System.out.println("Error fetching weather data. Please try again later.");
            }
        } catch (IOException e) {
            System.out.println("Network error. Please check your internet connection and try again.");
        } catch (Exception e) {
            System.out.println("An unexpected error occurred: " + e.getMessage());
        }
    }

    private static void displayWeatherData(JSONObject weatherData, String cityName) {
        try {
            // Extract data from JSON response
            JSONObject main = weatherData.getJSONObject("main");
            JSONObject weather = weatherData.getJSONArray("weather").getJSONObject(0);
            JSONObject wind = weatherData.getJSONObject("wind");
            JSONObject sys = weatherData.getJSONObject("sys");
            
            double temp = main.getDouble("temp");
            double feelsLike = main.getDouble("feels_like");
            int humidity = main.getInt("humidity");
            double windSpeed = wind.getDouble("speed");
            String weatherDescription = weather.getString("description");
            String country = sys.getString("country");
            long sunrise = sys.getLong("sunrise") * 1000;
            long sunset = sys.getLong("sunset") * 1000;
            
            // Format sunrise and sunset times
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
            String sunriseTime = timeFormat.format(new Date(sunrise));
            String sunsetTime = timeFormat.format(new Date(sunset));
            
            // Display weather information
            System.out.println("\n====================================");
            System.out.println("WEATHER IN " + cityName.toUpperCase() + ", " + country);
            System.out.println("====================================");
            System.out.println("Description: " + capitalizeWords(weatherDescription));
            System.out.println("Temperature: " + temp + "°C (feels like " + feelsLike + "°C)");
            System.out.println("Humidity: " + humidity + "%");
            System.out.println("Wind Speed: " + windSpeed + " m/s");
            System.out.println("Sunrise: " + sunriseTime);
            System.out.println("Sunset: " + sunsetTime);
            System.out.println("====================================");
            
        } catch (Exception e) {
            System.out.println("Error parsing weather data: " + e.getMessage());
        }
    }
    
    /**
     * Capitalizes the first letter of each word in a string
     * @param str the input string
     * @return the capitalized string
     */
    private static String capitalizeWords(String str) {
        String[] words = str.split("\\s");
        StringBuilder capitalized = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                capitalized.append(Character.toUpperCase(word.charAt(0)))
                          .append(word.substring(1))
                          .append(" ");
            }
        }
        return capitalized.toString().trim();
    }

}
