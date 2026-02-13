package com.gateway.system_manager_file.feign

import org.springframework.cloud.openfeign.FeignClient

@FeignClient("WEB-APPLICATION-CHAT")
interface FileFeign {



}