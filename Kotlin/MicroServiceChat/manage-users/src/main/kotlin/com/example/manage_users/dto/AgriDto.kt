package com.example.manage_users.dto

data class AgriUserDto(
    val userCode: String,
    val userFirstName: String? = null,
    val userLastName: String? = null,
    val userEmail: String? = null,
    val userPhoneNumber: String? = null,
    val isActive: Boolean = false,
    val userType: String? = null,
    val state: String? = null,
    val address: AgriAddressDto? = null,
    val roles: List<AgriRoleDto> = emptyList()
)

data class AgriAddressDto(
    val addressCountry: String? = null,
    val addressCity: String? = null,
    val addressDescription: String? = null,
    val region: String? = null
)

data class AgriRoleDto(
    val roleCode: String? = null,
    val roleName: String? = null
)

// Rapport renvoyé après la migration
data class MigrationReport(
    val total  : Int,
    val created: Int,
    val skipped: Int,
    val errors : Int,
    val details: List<String> = emptyList()
)

data class AgriApiResponse(
    val timestamp: String? = null,
    val data: List<AgriUserDto> = emptyList(),  // ← c'est ici que sont les users
    val code: Int? = null,
    val status: String? = null,
    val message: String? = null,
    val details: String? = null
)

enum class MigrationResultat { CREE, IGNORE }