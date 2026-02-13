package com.example.basicwebscraper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class BasicWebScraper {

    //Example: Scrape new headlines from a news website
    public static List<String> scrapeHeadlines(String url, String cssSelector) throws IOException {
        List<String> headline = new ArrayList<>();

        //Connect to the website and parse HTML
        Document doc = Jsoup.connect(url)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                        .timeout(10000)
                        .get();

        // Extract elements using CSS selector
        Elements element = doc.select(cssSelector);

        for (Element ele : element) {
            headline.add(ele.text().trim());
        }

        return headline;
    }

        //Example: Scrape new prices from a news website
    public static List<String> scrapePrices(String url, String cssSelector) throws IOException {
        List<String> price = new ArrayList<>();

        //Connect to the website and parse HTML
        Document doc = Jsoup.connect(url)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                        .timeout(10000)
                        .get();

        // Extract elements using CSS selector
        Elements element = doc.select(cssSelector);

        for (Element ele : element) {
            price.add(ele.text().trim());
        }

        return price;
    }

    // Check robots.txt (basic implementation)
    public static void checkRobotsTxt(String baseUrl) throws IOException {
        String robotUrl = baseUrl + "/robots.txt";
        try {
            Document robotDoc = Jsoup.connect(robotUrl)
                                    .userAgent("Mozilla/5.0")
                                    .timeout(10000)
                                    .get();
            
            System.out.println("Robots.txt content for: " + baseUrl + ":");
            System.out.println(robotDoc.text());
            
        } catch(IOException e) {
            System.out.println("No robot.txt found or accessible: " + baseUrl);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
