package com.example.manage_users.service.interf

import com.example.manage_users.dto.AgriUserDto
import com.example.manage_users.dto.MigrationReport
import com.example.manage_users.dto.MigrationResultat

interface MigrationService {

    fun migrerTousLesUsers(): MigrationReport

    fun migrerUnUser(agriUser: AgriUserDto): MigrationResultat

}