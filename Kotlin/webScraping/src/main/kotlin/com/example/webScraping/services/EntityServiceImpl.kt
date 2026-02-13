package com.example.webScraping.services

import com.example.webScraping.model.StateStats
import com.example.webScraping.repository.StatesRepository
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.util.function.Consumer

@Service
class EntityServiceImpl(
    private val entityManager: EntityManager,
    private val statsRepository: StatesRepository
): EntityService {

    @Transactional
    override fun persistCoronaData(dataList: MutableList<StateStats>) {
        TODO("Not yet implemented")
        dataList.forEach(Consumer { entity: StateStats? -> entityManager.merge(entity) })
    }

    override fun getStateWiseCoronaData(): MutableList<StateStats?> {
        return statsRepository.getAllStates()
    }

}