import org.mindrot.jbcrypt.BCrypt

fun main() {
    val password = "myPassword"
    val salt = BCrypt.gensalt(16)        // strength 16
    val hash = BCrypt.hashpw(password, salt)

    println("Hash: $hash")

    val matches = BCrypt.checkpw(password, hash)
    println("Matches: $matches")
}
// To run this code, ensure you have the jBCrypt library included in your project dependencies.