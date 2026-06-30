package com.example.manage_users.mapper

import com.example.manage_users.dto.AgCollectDto
import com.example.manage_users.dto.AgTerrainDto
import com.example.manage_users.dto.DGeneraleDto
import com.example.manage_users.dto.DPlantationDto
import com.example.manage_users.dto.RespoStockDto
import com.example.manage_users.dto.SuperAdminDto
import com.example.manage_users.models.Users
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.time.format.DateTimeFormatter
import java.util.UUID

@Component
class UserMapper {

    private val formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME


// ─────────────────────────────────────────────────────────────────────────────
//  Note : id = "" dans tous les toEntity()
//  L'ID réel est généré automatiquement par @PrePersist dans Users.generateId()
//  au format USERS-{ROLE}_{UUID_COURT}  ex: USERS-SUPER_ADMIN_a3f9b2c1
// ─────────────────────────────────────────────────────────────────────────────

// ── SUPER_ADMIN ───────────────────────────────────────────────────────────────

    fun SuperAdminDto.SuperAdminCreateDto.toEntity(encoder: PasswordEncoder) = Users(
        id             = "",   // généré par @PrePersist → USERS-SUPER_ADMIN_xxxxxxxx
        email          = email,
        password       = encoder.encode(password ?: UUID.randomUUID().toString()),
        firstName      = firstName,
        lastName       = lastName,
        phoneNumber    = phoneNumber,
        language       = language,
        emailNotifications = emailNotifications,
        role           = role,
        permission     = permission,
        status         = status
    )

    fun Users.toSuperAdminResponse() = SuperAdminDto.SuperAdminResponseDto(
        id = id,
        email = email,
        firstName = firstName,
        lastName = lastName,
        phoneNumber = phoneNumber,
        address = address,
        role = role,
        permission = permission,
        status = status,
        isActive = isActive,
        emailVerified = emailVerified,
        failedLoginAttempts = failedLoginAttempts,
        language = language,
        emailNotifications = emailNotifications,
        createdAt = createdAt.format(formatter)
    )

    fun Users.applyUpdate(dto: SuperAdminDto.SuperAdminUpdateDto): Users {
        dto.email?.let              { email = it }
        dto.firstName?.let          { firstName = it }
        dto.lastName?.let           { lastName = it }
        dto.phoneNumber?.let        { phoneNumber = it }
        dto.address?.let            { address = it }
        dto.language?.let           { language = it }
        dto.isActive?.let           { isActive = it }
        dto.emailNotifications?.let { emailNotifications = it }
        return this
    }

// ── D_GENERALE ────────────────────────────────────────────────────────────────

    fun DGeneraleDto.DGeneraleCreateDto.toEntity(encoder: PasswordEncoder) = Users(
        id             = "",   // généré par @PrePersist → USERS-D_GENERALE_xxxxxxxx
        email          = email,
        password       = encoder.encode(password ?: UUID.randomUUID().toString()),
        firstName      = firstName,
        lastName       = lastName,
        phoneNumber    = phoneNumber,
        language       = language,
        emailNotifications = emailNotifications,
        role           = role,
        permission     = permission,
        status         = status
    )

    fun Users.toDGeneraleResponse() = DGeneraleDto.DGeneraleResponseDto(
        id = id,
        email = email,
        firstName = firstName,
        lastName = lastName,
        phoneNumber = phoneNumber,
        address = address,
        role = role,
        permission = permission,
        status = status,
        isActive = isActive,
        emailVerified = emailVerified,
        language = language,
        emailNotifications = emailNotifications,
        createdAt = createdAt.format(formatter)
    )

    fun Users.applyUpdate(dto: DGeneraleDto.DGeneraleUpdateDto): Users {
        dto.email?.let              { email = it }
        dto.firstName?.let          { firstName = it }
        dto.lastName?.let           { lastName = it }
        dto.phoneNumber?.let        { phoneNumber = it }
        dto.address?.let            { address = it }
        dto.language?.let           { language = it }
        dto.emailNotifications?.let { emailNotifications = it }
        dto.status?.let             { status = it }
        dto.isActive?.let           { isActive = it }
        dto.permission?.let         { permission = it }
        return this
    }

// ── D_PLANTATION ──────────────────────────────────────────────────────────────

    fun DPlantationDto.DPlantationCreateDto.toEntity(encoder: PasswordEncoder) = Users(
        id             = "",   // généré par @PrePersist → USERS-D_PLANTATION_xxxxxxxx
        email          = email,
        password       = encoder.encode(password ?: UUID.randomUUID().toString()),
        firstName      = firstName,
        lastName       = lastName,
        phoneNumber    = phoneNumber,
        address        = address,
        language       = language,
        emailNotifications = emailNotifications,
        role           = role,
        permission     = permission,
        status         = status
    )

    fun Users.toDPlantationResponse() = DPlantationDto.DPlantationResponseDto(
        id = id,
        email = email,
        firstName = firstName,
        lastName = lastName,
        phoneNumber = phoneNumber,
        address = address,
        role = role,
        permission = permission,
        status = status,
        isActive = isActive,
        emailVerified = emailVerified,
        language = language,
        emailNotifications = emailNotifications,
        createdAt = createdAt.format(formatter)
    )

    fun Users.applyUpdate(dto: DPlantationDto.DPlantationUpdateDto): Users {
        dto.email?.let              { email = it }
        dto.firstName?.let          { firstName = it }
        dto.lastName?.let           { lastName = it }
        dto.phoneNumber?.let        { phoneNumber = it }
        dto.address?.let            { address = it }
        dto.language?.let           { language = it }
        dto.emailNotifications?.let { emailNotifications = it }
        dto.status?.let             { status = it }
        dto.isActive?.let           { isActive = it }
        return this
    }

// ── RESPO_STOCK ───────────────────────────────────────────────────────────────

    fun RespoStockDto.RespoStockCreateDto.toEntity(encoder: PasswordEncoder) = Users(
        id             = "",   // généré par @PrePersist → USERS-RESPO_STOCK_xxxxxxxx
        email          = email,
        password       = encoder.encode(password ?: UUID.randomUUID().toString()),
        firstName      = firstName,
        lastName       = lastName,
        phoneNumber    = phoneNumber,
        address        = address,
        language       = language,
        emailNotifications = emailNotifications,
        role           = role,
        permission     = permission,
        status         = status
    )

    fun Users.toRespoStockResponse() = RespoStockDto.RespoStockResponseDto(
        id = id,
        email = email,
        firstName = firstName,
        lastName = lastName,
        phoneNumber = phoneNumber,
        address = address,
        role = role,
        permission = permission,
        status = status,
        isActive = isActive,
        emailVerified = emailVerified,
        language = language,
        emailNotifications = emailNotifications,
        createdAt = createdAt.format(formatter)
    )

    fun Users.applyUpdate(dto: RespoStockDto.RespoStockUpdateDto): Users {
        dto.email?.let              { email = it }
        dto.firstName?.let          { firstName = it }
        dto.lastName?.let           { lastName = it }
        dto.phoneNumber?.let        { phoneNumber = it }
        dto.address?.let            { address = it }
        dto.language?.let           { language = it }
        dto.emailNotifications?.let { emailNotifications = it }
        dto.status?.let             { status = it }
        dto.isActive?.let           { isActive = it }
        return this
    }

// ── AG_TERRAIN ────────────────────────────────────────────────────────────────

    fun AgTerrainDto.AgTerrainCreateDto.toEntity(encoder: PasswordEncoder) = Users(
        id             = "",   // généré par @PrePersist → USERS-AG_TERRAIN_xxxxxxxx
        email          = email,
        password       = encoder.encode(password ?: UUID.randomUUID().toString()),
        firstName      = firstName,
        lastName       = lastName,
        phoneNumber    = phoneNumber,
        address        = address,
        language       = language,
        emailNotifications = emailNotifications,
        role           = role,
        permission     = permission,
        status         = status
    )

    fun Users.toAgTerrainResponse() = AgTerrainDto.AgTerrainResponseDto(
        id = id,
        email = email,
        firstName = firstName,
        lastName = lastName,
        phoneNumber = phoneNumber,
        address = address,
        role = role,
        permission = permission,
        status = status,
        isActive = isActive,
        emailVerified = emailVerified,
        language = language,
        emailNotifications = emailNotifications,
        createdAt = createdAt.format(formatter)
    )

    fun Users.applyUpdate(dto: AgTerrainDto.AgTerrainUpdateDto): Users {
        dto.email?.let              { email = it }
        dto.firstName?.let          { firstName = it }
        dto.lastName?.let           { lastName = it }
        dto.phoneNumber?.let        { phoneNumber = it }
        dto.address?.let            { address = it }
        dto.language?.let           { language = it }
        dto.emailNotifications?.let { emailNotifications = it }
        dto.status?.let             { status = it }
        dto.isActive?.let           { isActive = it }
        return this
    }

// ── AG_COLLECTE ───────────────────────────────────────────────────────────────

    fun AgCollectDto.AgCollecteCreateDto.toEntity(encoder: PasswordEncoder) = Users(
        id             = "",   // généré par @PrePersist → USERS-AG_COLLECTE_xxxxxxxx
        email          = email,
        password       = encoder.encode(password ?: UUID.randomUUID().toString()),
        firstName      = firstName,
        lastName       = lastName,
        phoneNumber    = phoneNumber,
        address        = address,
        language       = language,
        emailNotifications = emailNotifications,
        role           = role,
        permission     = permission,
        status         = status
    )

    fun Users.toAgCollecteResponse() = AgCollectDto.AgCollecteResponseDto(
        id = id,
        email = email,
        firstName = firstName,
        lastName = lastName,
        phoneNumber = phoneNumber,
        address = address,
        role = role,
        permission = permission,
        status = status,
        isActive = isActive,
        emailVerified = emailVerified,
        language = language,
        emailNotifications = emailNotifications,
        createdAt = createdAt.format(formatter)
    )

    fun Users.applyUpdate(dto: AgCollectDto.AgCollecteUpdateDto): Users {
        dto.email?.let              { email = it }
        dto.firstName?.let          { firstName = it }
        dto.lastName?.let           { lastName = it }
        dto.phoneNumber?.let        { phoneNumber = it }
        dto.address?.let            { address = it }
        dto.language?.let           { language = it }
        dto.emailNotifications?.let { emailNotifications = it }
        dto.status?.let             { status = it }
        dto.isActive?.let           { isActive = it }
        return this
    }


}