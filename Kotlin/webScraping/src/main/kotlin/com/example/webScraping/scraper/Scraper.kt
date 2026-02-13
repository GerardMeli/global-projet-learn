package com.example.webScraping.scraper

import com.example.webScraping.model.StateStats
import org.jsoup.Jsoup
import org.jsoup.nodes.Element
import org.springframework.stereotype.Component
import java.io.IOException

@Component
class Scraper {


    /**
     * Gets covoid data.
     *
     * @return List of [StateStats]the covoid data
     * @throws IOException the io exception
     *
     * Removed unused variable stateRows since it wasn't being used
     * Parse all values first before creating the StateStats object to match the data class constructor
     * Use named parameters when creating StateStats for better readability
     * Provide default values (0L for Long, "" for String) when parsing fails or elements are missing
     * Added inline comments explaining what each section parses for better code documentation
     * Cleaner structure that aligns with Kotlin idioms and the immutable data class pattern
     *
     */
    @Throws(IOException::class)
    fun getCovidData(): MutableList<StateStats> {
        val statsList = ArrayList<StateStats>()
        val doc = Jsoup.connect("https://www.mohfw.gov.in/").get()
        val tableRows = doc.getElementById("state-data")
            ?.select("table")
            ?.select("tr")
            ?: return statsList

        for (stateData in tableRows) {
            val itr = stateData.select("td").iterator()

            if (itr.hasNext()) {
                val firstElement = itr.next()
                if (!isRowNotRequired(firstElement)) {
                    // Parse ID from first element
                    val id = firstElement.html().toLongOrNull() ?: 0L

                    // Parse name from second element
                    val name = if (itr.hasNext()) {
                        val nameElement = itr.next()
                        if (nameElement.hasText()) nameElement.html() else ""
                    } else ""

                    // Parse active cases from third element
                    val activeCasesCount = if (itr.hasNext()) {
                        val activeCasesElement = itr.next()
                        if (activeCasesElement.hasText()) activeCasesElement.html().toLongOrNull() ?: 0L else 0L
                    } else 0L

                    // Parse resolved cases from fourth element
                    val resolvedCasesCount = if (itr.hasNext()) {
                        val resolvedCasesElement = itr.next()
                        if (resolvedCasesElement.hasText()) resolvedCasesElement.html().toLongOrNull() ?: 0L else 0L
                    } else 0L

                    // Parse death cases from fifth element
                    val deathCasesCount = if (itr.hasNext()) {
                        val deathsElement = itr.next()
                        if (deathsElement.hasText()) deathsElement.html().toLongOrNull() ?: 0L else 0L
                    } else 0L

                    // Parse total cases from sixth element
                    val totalCasesCount = if (itr.hasNext()) {
                        val totalElement = itr.next()
                        if (totalElement.hasText()) totalElement.html().toLongOrNull() ?: 0L else 0L
                    } else 0L

                    // Create StateStats object with all parsed values
                    val stat = StateStats(
                        id = id,
                        name = name,
                        activeCasesCount = activeCasesCount,
                        resolvedCasesCount = resolvedCasesCount,
                        deathCasesCount = deathCasesCount,
                        totalCasesCount = totalCasesCount
                    )

                    statsList.add(stat)
                }
            }
        }

        return statsList
    }

    /**
     * Tells whether the row contains valid data to be scraped or not.
     * Filters out rows with center-aligned styling, empty rows, header rows,
     * and reassignment notice rows.
     *
     * @param dataItem the table data element to check
     * @return true if the row should be skipped, false otherwise
     * tells wheter the row contains valid data to be scraped or not
     * @param dataItem
     * @return
     */
    private fun isRowNotRequired(dataItem: Element): Boolean {
        return dataItem.hasClass("text-align:center;")
                || !dataItem.hasText()
                || dataItem.html().startsWith("<strong>")
                || dataItem.html().startsWith(
            "Cases being reassigned "
                    + "to states"
        )
    }

}