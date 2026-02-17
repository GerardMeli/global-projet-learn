package com.reli237.web_application_chat.repository

import com.reli237.web_application_chat.model.PrivateChat
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface PrivateChatRepository  : JpaRepository<PrivateChat, Long> {

    @Query("""
        SELECT pc FROM PrivateChat pc 
        WHERE (pc.senderId1 = :userId1 AND pc.senderId2 = :userId2) 
           OR (pc.senderId1 = :userId2 AND pc.senderId2 = :userId1)
        ORDER BY pc.timestamp ASC
    """)
    fun findChatBetweenUsers(
        @Param("userId1") userId1: Long,
        @Param("userId2") userId2: Long
    ): List<PrivateChat>

    // Trouver toutes les conversations d'un utilisateur
    @Query("""
        SELECT pc FROM PrivateChat pc 
        WHERE pc.senderId1 = :userId OR pc.senderId2 = :userId
        ORDER BY pc.timestamp ASC
    """)
    fun findUserChats(@Param("userId") userId: Long): List<PrivateChat>

    // Trouver les IDs des contacts d'un utilisateur (sans jointure sur User)
    @Query("""
        SELECT DISTINCT CASE 
            WHEN pc.senderId1 = :userId THEN pc.senderId2
            ELSE pc.senderId1
        END
        FROM PrivateChat pc
        WHERE pc.senderId1 = :userId OR pc.senderId2 = :userId
    """)
    fun findUserContactIds(@Param("userId") userId: Long): List<Long>

    // Marquer les messages comme lus - CORRECTION ICI
    @Modifying
    @Query("""
        UPDATE PrivateChat pc 
        SET pc.isRead = true 
        WHERE pc.id IN :messageIds AND pc.senderId2 = :userId
    """)
    fun markMessagesAsRead(
        @Param("messageIds") messageIds: List<Long>,
        @Param("userId") userId: Long
    ): Int

    // Trouver des messages par IDs et utilisateur - CORRECTION ICI
    @Query("""
        SELECT pc FROM PrivateChat pc 
        WHERE pc.id IN :messageIds AND pc.senderId2 = :userId
    """)
    fun findMessagesByIdsAndUser(
        @Param("messageIds") messageIds: List<Long>,
        @Param("userId") userId: Long
    ): List<PrivateChat>

    // Compter les messages non lus pour un utilisateur
    @Query("""
        SELECT COUNT(pc) FROM PrivateChat pc 
        WHERE pc.senderId2 = :userId AND pc.isRead = false
    """)
    fun countUnreadMessages(@Param("userId") userId: Long): Long
}