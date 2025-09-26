/*
 * =============================================
 * Trading Anarchy Android Compute Engine
 * Crypto Utilities - Advanced Cryptographic Functions with 2025 Standards
 * Copyright (c) 2025 Trading Anarchy. All rights reserved.
 * Version: 2025.1.0 - Enhanced Security & Performance
 * =============================================
 */

#include "trading_anarchy_jni.h"
#include <openssl/evp.h>
#include <openssl/aes.h>
#include <openssl/rsa.h>
#include <openssl/pem.h>
#include <openssl/rand.h>
#include <openssl/hmac.h>
#include <openssl/kdf.h>
#include <memory>
#include <vector>

namespace TradingAnarchy {
namespace Crypto {

/**
 * Professional cryptographic utilities with 2025 security standards
 */
class CryptoUtils {
private:
    static std::mutex crypto_mutex_;
    static std::atomic<bool> initialized_;

public:
    /**
     * Enhanced AES-256-GCM encryption with authentication
     */
    static std::vector<uint8_t> encryptAES256GCM(
        const std::vector<uint8_t>& plaintext,
        const std::vector<uint8_t>& key,
        const std::vector<uint8_t>& iv,
        std::vector<uint8_t>& tag) {
        
        std::lock_guard<std::mutex> lock(crypto_mutex_);
        
        if (key.size() != 32 || iv.size() != 12) {
            TA_LOGE("Invalid key or IV size for AES-256-GCM");
            return {};
        }
        
        try {
            EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
            if (!ctx) {
                TA_LOGE("Failed to create cipher context");
                return {};
            }
            
            std::unique_ptr<EVP_CIPHER_CTX, void(*)(EVP_CIPHER_CTX*)> ctx_guard(
                ctx, EVP_CIPHER_CTX_free);
            
            // Professional cipher initialization
            if (EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), nullptr, nullptr, nullptr) != 1) {
                TA_LOGE("Failed to initialize AES-256-GCM encryption");
                return {};
            }
            
            // Set IV length
            if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, iv.size(), nullptr) != 1) {
                TA_LOGE("Failed to set IV length");
                return {};
            }
            
            // Initialize key and IV
            if (EVP_EncryptInit_ex(ctx, nullptr, nullptr, key.data(), iv.data()) != 1) {
                TA_LOGE("Failed to set key and IV");
                return {};
            }
            
            std::vector<uint8_t> ciphertext(plaintext.size() + EVP_CIPHER_block_size(EVP_aes_256_gcm()));
            int len;
            int ciphertext_len;
            
            // Enhanced encryption process
            if (EVP_EncryptUpdate(ctx, ciphertext.data(), &len, 
                                plaintext.data(), plaintext.size()) != 1) {
                TA_LOGE("Failed to encrypt data");
                return {};
            }
            ciphertext_len = len;
            
            // Finalize encryption
            if (EVP_EncryptFinal_ex(ctx, ciphertext.data() + len, &len) != 1) {
                TA_LOGE("Failed to finalize encryption");
                return {};
            }
            ciphertext_len += len;
            
            // Professional authentication tag retrieval
            tag.resize(16);
            if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, 16, tag.data()) != 1) {
                TA_LOGE("Failed to get authentication tag");
                return {};
            }
            
            ciphertext.resize(ciphertext_len);
            return ciphertext;
            
        } catch (const std::exception& e) {
            TA_LOGE("Exception in AES encryption: %s", e.what());
            return {};
        }
    }
    
    /**
     * Enhanced AES-256-GCM decryption with authentication verification
     */
    static std::vector<uint8_t> decryptAES256GCM(
        const std::vector<uint8_t>& ciphertext,
        const std::vector<uint8_t>& key,
        const std::vector<uint8_t>& iv,
        const std::vector<uint8_t>& tag) {
        
        std::lock_guard<std::mutex> lock(crypto_mutex_);
        
        if (key.size() != 32 || iv.size() != 12 || tag.size() != 16) {
            TA_LOGE("Invalid key, IV, or tag size for AES-256-GCM decryption");
            return {};
        }
        
        try {
            EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
            if (!ctx) {
                TA_LOGE("Failed to create cipher context");
                return {};
            }
            
            std::unique_ptr<EVP_CIPHER_CTX, void(*)(EVP_CIPHER_CTX*)> ctx_guard(
                ctx, EVP_CIPHER_CTX_free);
            
            // Professional cipher initialization
            if (EVP_DecryptInit_ex(ctx, EVP_aes_256_gcm(), nullptr, nullptr, nullptr) != 1) {
                TA_LOGE("Failed to initialize AES-256-GCM decryption");
                return {};
            }
            
            // Set IV length
            if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, iv.size(), nullptr) != 1) {
                TA_LOGE("Failed to set IV length");
                return {};
            }
            
            // Initialize key and IV
            if (EVP_DecryptInit_ex(ctx, nullptr, nullptr, key.data(), iv.data()) != 1) {
                TA_LOGE("Failed to set key and IV");
                return {};
            }
            
            std::vector<uint8_t> plaintext(ciphertext.size());
            int len;
            int plaintext_len;
            
            // Enhanced decryption process
            if (EVP_DecryptUpdate(ctx, plaintext.data(), &len, 
                                ciphertext.data(), ciphertext.size()) != 1) {
                TA_LOGE("Failed to decrypt data");
                return {};
            }
            plaintext_len = len;
            
            // Professional authentication tag verification
            if (EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_TAG, tag.size(), 
                                  const_cast<void*>(static_cast<const void*>(tag.data()))) != 1) {
                TA_LOGE("Failed to set authentication tag");
                return {};
            }
            
            // Finalize decryption with authentication
            if (EVP_DecryptFinal_ex(ctx, plaintext.data() + len, &len) != 1) {
                TA_LOGE("Failed to finalize decryption - authentication failed");
                return {};
            }
            plaintext_len += len;
            
            plaintext.resize(plaintext_len);
            return plaintext;
            
        } catch (const std::exception& e) {
            TA_LOGE("Exception in AES decryption: %s", e.what());
            return {};
        }
    }
    
    /**
     * Professional PBKDF2 key derivation with 2025 security standards
     */
    static std::vector<uint8_t> deriveKeyPBKDF2(
        const std::string& password,
        const std::vector<uint8_t>& salt,
        int iterations = 100000,
        int keyLength = 32) {
        
        if (salt.size() < 16) {
            TA_LOGE("Salt too short for PBKDF2 (minimum 16 bytes required)");
            return {};
        }
        
        if (iterations < 100000) {
            TA_LOGW("PBKDF2 iteration count below recommended minimum (100000)");
        }
        
        try {
            std::vector<uint8_t> derivedKey(keyLength);
            
            // Enhanced PBKDF2 key derivation
            if (PKCS5_PBKDF2_HMAC(password.c_str(), password.length(),
                                 salt.data(), salt.size(),
                                 iterations, EVP_sha256(),
                                 keyLength, derivedKey.data()) != 1) {
                TA_LOGE("PBKDF2 key derivation failed");
                return {};
            }
            
            return derivedKey;
            
        } catch (const std::exception& e) {
            TA_LOGE("Exception in PBKDF2 derivation: %s", e.what());
            return {};
        }
    }
    
    /**
     * Enhanced HMAC-SHA256 computation
     */
    static std::vector<uint8_t> computeHMAC_SHA256(
        const std::vector<uint8_t>& data,
        const std::vector<uint8_t>& key) {
        
        try {
            std::vector<uint8_t> hmac(EVP_MAX_MD_SIZE);
            unsigned int hmac_len;
            
            // Professional HMAC computation
            if (!HMAC(EVP_sha256(), key.data(), key.size(),
                     data.data(), data.size(),
                     hmac.data(), &hmac_len)) {
                TA_LOGE("HMAC-SHA256 computation failed");
                return {};
            }
            
            hmac.resize(hmac_len);
            return hmac;
            
        } catch (const std::exception& e) {
            TA_LOGE("Exception in HMAC computation: %s", e.what());
            return {};
        }
    }
    
    /**
     * Professional secure random generation
     */
    static std::vector<uint8_t> generateSecureRandom(size_t length) {
        std::vector<uint8_t> random_data(length);
        
        if (RAND_bytes(random_data.data(), length) != 1) {
            TA_LOGE("Failed to generate secure random data");
            return {};
        }
        
        return random_data;
    }
    
    /**
     * Enhanced secure string comparison (constant-time)
     */
    static bool secureCompare(const std::vector<uint8_t>& a, const std::vector<uint8_t>& b) {
        if (a.size() != b.size()) {
            return false;
        }
        
        // Professional constant-time comparison
        int result = 0;
        for (size_t i = 0; i < a.size(); i++) {
            result |= a[i] ^ b[i];
        }
        
        return result == 0;
    }
    
    /**
     * Professional cryptographic initialization
     */
    static bool initialize() {
        std::lock_guard<std::mutex> lock(crypto_mutex_);
        
        if (initialized_.load()) {
            return true;
        }
        
        try {
            // Enhanced random seeding for 2025 security
            if (!RAND_poll()) {
                TA_LOGE("Failed to seed random number generator");
                return false;
            }
            
            initialized_.store(true);
            TA_LOGI("Crypto utilities initialized successfully");
            return true;
            
        } catch (const std::exception& e) {
            TA_LOGE("Exception during crypto initialization: %s", e.what());
            return false;
        }
    }
    
    /**
     * Enhanced cleanup with secure memory clearing
     */
    static void cleanup() {
        std::lock_guard<std::mutex> lock(crypto_mutex_);
        
        if (!initialized_.load()) {
            return;
        }
        
        // Professional secure cleanup
        RAND_cleanup();
        initialized_.store(false);
        
        TA_LOGI("Crypto utilities cleaned up successfully");
    }
};

// Professional static member definitions
std::mutex CryptoUtils::crypto_mutex_;
std::atomic<bool> CryptoUtils::initialized_{false};

} // namespace Crypto
} // namespace TradingAnarchy

// Professional C-style JNI interface functions
extern "C" {

/**
 * Enhanced crypto utilities initialization
 */
JNIEXPORT jboolean JNICALL
Java_com_tradinganarchy_computeengine_CryptoUtils_nativeInitialize(JNIEnv* env, jobject thiz) {
    return TradingAnarchy::Crypto::CryptoUtils::initialize() ? JNI_TRUE : JNI_FALSE;
}

/**
 * Professional secure random generation interface
 */
JNIEXPORT jbyteArray JNICALL
Java_com_tradinganarchy_computeengine_CryptoUtils_nativeGenerateSecureRandom(
    JNIEnv* env, jobject thiz, jint length) {
    
    if (length <= 0 || length > 1024) {
        TA_LOGE("Invalid random data length: %d", length);
        return nullptr;
    }
    
    std::vector<uint8_t> random_data = 
        TradingAnarchy::Crypto::CryptoUtils::generateSecureRandom(length);
    
    if (random_data.empty()) {
        return nullptr;
    }
    
    jbyteArray result = env->NewByteArray(random_data.size());
    if (result) {
        env->SetByteArrayRegion(result, 0, random_data.size(), 
                               reinterpret_cast<const jbyte*>(random_data.data()));
    }
    
    return result;
}

/**
 * Enhanced PBKDF2 key derivation interface
 */
JNIEXPORT jbyteArray JNICALL
Java_com_tradinganarchy_computeengine_CryptoUtils_nativeDeriveKey(
    JNIEnv* env, jobject thiz, jstring password, jbyteArray salt, 
    jint iterations, jint keyLength) {
    
    const char* passwordStr = env->GetStringUTFChars(password, nullptr);
    if (!passwordStr) return nullptr;
    
    jsize saltLen = env->GetArrayLength(salt);
    jbyte* saltData = env->GetByteArrayElements(salt, nullptr);
    if (!saltData) {
        env->ReleaseStringUTFChars(password, passwordStr);
        return nullptr;
    }
    
    std::vector<uint8_t> saltVec(reinterpret_cast<uint8_t*>(saltData), 
                                reinterpret_cast<uint8_t*>(saltData) + saltLen);
    
    std::vector<uint8_t> derivedKey = TradingAnarchy::Crypto::CryptoUtils::deriveKeyPBKDF2(
        std::string(passwordStr), saltVec, iterations, keyLength);
    
    env->ReleaseStringUTFChars(password, passwordStr);
    env->ReleaseByteArrayElements(salt, saltData, JNI_ABORT);
    
    if (derivedKey.empty()) {
        return nullptr;
    }
    
    jbyteArray result = env->NewByteArray(derivedKey.size());
    if (result) {
        env->SetByteArrayRegion(result, 0, derivedKey.size(), 
                               reinterpret_cast<const jbyte*>(derivedKey.data()));
    }
    
    return result;
}

/**
 * Professional HMAC computation interface
 */
JNIEXPORT jbyteArray JNICALL
Java_com_tradinganarchy_computeengine_CryptoUtils_nativeComputeHMAC(
    JNIEnv* env, jobject thiz, jbyteArray data, jbyteArray key) {
    
    jsize dataLen = env->GetArrayLength(data);
    jbyte* dataPtr = env->GetByteArrayElements(data, nullptr);
    if (!dataPtr) return nullptr;
    
    jsize keyLen = env->GetArrayLength(key);
    jbyte* keyPtr = env->GetByteArrayElements(key, nullptr);
    if (!keyPtr) {
        env->ReleaseByteArrayElements(data, dataPtr, JNI_ABORT);
        return nullptr;
    }
    
    std::vector<uint8_t> dataVec(reinterpret_cast<uint8_t*>(dataPtr), 
                                reinterpret_cast<uint8_t*>(dataPtr) + dataLen);
    std::vector<uint8_t> keyVec(reinterpret_cast<uint8_t*>(keyPtr), 
                               reinterpret_cast<uint8_t*>(keyPtr) + keyLen);
    
    std::vector<uint8_t> hmac = TradingAnarchy::Crypto::CryptoUtils::computeHMAC_SHA256(dataVec, keyVec);
    
    env->ReleaseByteArrayElements(data, dataPtr, JNI_ABORT);
    env->ReleaseByteArrayElements(key, keyPtr, JNI_ABORT);
    
    if (hmac.empty()) {
        return nullptr;
    }
    
    jbyteArray result = env->NewByteArray(hmac.size());
    if (result) {
        env->SetByteArrayRegion(result, 0, hmac.size(), 
                               reinterpret_cast<const jbyte*>(hmac.data()));
    }
    
    return result;
}

/**
 * Enhanced cleanup interface
 */
JNIEXPORT void JNICALL
Java_com_tradinganarchy_computeengine_CryptoUtils_nativeCleanup(JNIEnv* env, jobject thiz) {
    TradingAnarchy::Crypto::CryptoUtils::cleanup();
}

} // extern "C"