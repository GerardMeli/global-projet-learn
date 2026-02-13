package com.example.webScraping.services

import com.example.webScraping.model.StateStats


interface EntityService {

    fun persistCoronaData(dataList: MutableList<StateStats>)

    fun getStateWiseCoronaData(): MutableList<StateStats?>

}