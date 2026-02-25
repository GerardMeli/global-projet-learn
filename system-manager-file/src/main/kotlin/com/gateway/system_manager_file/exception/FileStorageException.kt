package com.gateway.system_manager_file.exception


//class FileStorageException : RuntimeException {
//
//    constructor(message: String) : super(message)
//
//    constructor(message: String, cause: Throwable) : super(message, cause)
//}


class FileStorageException(
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)