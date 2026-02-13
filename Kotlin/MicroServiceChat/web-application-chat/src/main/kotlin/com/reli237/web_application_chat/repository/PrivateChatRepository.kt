package com.reli237.web_application_chat.repository

import com.reli237.web_application_chat.model.PrivateChat
import com.reli237.web_application_chat.model.Users
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional

interface PrivateChatRepository  : JpaRepository<PrivateChat, Long> {

    @Query("""
        SELECT pc FROM PrivateChat pc 
        WHERE (pc.senderId1.id = :userId1 AND pc.senderId2.id = :userId2) 
           OR (pc.senderId1.id = :userId2 AND pc.senderId2.id = :userId1)
        ORDER BY pc.timestamp ASC
    """)
    fun findChatBetweenUsers(
        @Param("userId1") userId1: Long,
        @Param("userId2") userId2: Long
    ): List<PrivateChat>

    @Query("""
        SELECT pc FROM PrivateChat pc 
        WHERE (pc.senderId1.id = :userId OR pc.senderId2.id = :userId)
        ORDER BY pc.timestamp DESC
    """)
    fun findUserChats(@Param("userId") userId: Long): List<PrivateChat>

    @Query("""
    SELECT DISTINCT u FROM Users u 
    WHERE u.id IN (
        SELECT CASE 
            WHEN pc.senderId1.id = :userId THEN pc.senderId2.id 
            ELSE pc.senderId1.id 
        END
        FROM PrivateChat pc 
        WHERE pc.senderId1.id = :userId OR pc.senderId2.id = :userId
        )
    """)
    fun findUserContacts(@Param("userId") userId: Long): List<Users>

    @Query("""
        SELECT pc FROM PrivateChat pc 
        WHERE pc.id IN :messageIds 
        AND (pc.senderId1.id = :userId OR pc.senderId2.id = :userId)
    """)
    fun findMessagesByIdsAndUser(
        @Param("messageIds") messageIds: List<Long>,
        @Param("userId") userId: Long
    ): List<PrivateChat>

    @Modifying
    @Transactional
    @Query("""
        UPDATE PrivateChat pc 
        SET pc.isRead = true 
        WHERE pc.id IN :messageIds 
        AND pc.senderId2.id = :receiverId
    """)
    fun markMessagesAsRead(
        @Param("messageIds") messageIds: List<Long>,
        @Param("receiverId") userId: Long
    ): Int

    @Query("""
        SELECT COUNT(pc) FROM PrivateChat pc 
        WHERE pc.senderId2.id = :userId 
        AND pc.isRead = false
    """)
    fun countUnreadMessages(@Param("userId") userId: Long): Long
}