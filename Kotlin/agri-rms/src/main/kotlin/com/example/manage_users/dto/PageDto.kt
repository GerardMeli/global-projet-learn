package com.example.manage_users.dto

import org.springframework.data.domain.Page

class PageDto {
    data class PageResponse<T>(
        val content: List<T>,
        val pageNumber: Int,
        val pageSize: Int,
        val totalElements: Long,
        val totalPages: Int,
        val isFirst: Boolean,
        val isLast: Boolean,
        val hasNext: Boolean,
        val hasPrevious: Boolean
    ) {
        companion object {
            fun <T, R> fromPage(page: Page<T>, mapper: (T) -> R): PageResponse<R> {
                return PageResponse(
                    content = page.content.map(mapper),
                    pageNumber = page.number,
                    pageSize = page.size,
                    totalElements = page.totalElements,
                    totalPages = page.totalPages,
                    isFirst = page.isFirst,
                    isLast = page.isLast,
                    hasNext = page.hasNext(),
                    hasPrevious = page.hasPrevious()
                )
            }
        }
    }
}