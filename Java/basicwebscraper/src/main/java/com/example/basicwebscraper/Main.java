package com.example.basicwebscraper;

import java.io.IOException;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // System.out.println("Hello world!");

        Scanner sacnner = new Scanner(System.in);
        System.out.println("Enter the url to scrape: ");
        String url = sacnner.nextLine();

        try {
            // Example usage
            String headlineSelector = "h2.headline, h3.headline, .news-title";

            // Check Robots.txt
            BasicWebScraper.checkRobotsTxt(url);

            // Scrape headlines
            List<String> headLines = BasicWebScraper.scrapeHeadlines(url, headlineSelector);

            System.out.println("Scraped Headlines: ");
            for (int i = 0; i < headLines.size(); i++) {
                System.out.println((i + 1) + ". " + headLines.get(i));
                
            }
        } catch (IOException e) {
            System.err.println("Error during scraping: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }

        sacnner.close();

    }
}