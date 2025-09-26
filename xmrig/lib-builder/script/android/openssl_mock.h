/**
 * Mock OpenSSL Headers for IntelliSense
 * Trading Anarchy 2025 - Development Environment Support
 */

#ifndef TRADING_ANARCHY_OPENSSL_MOCK_H
#define TRADING_ANARCHY_OPENSSL_MOCK_H

#ifdef __cplusplus
extern "C" {
#endif

// Mock OpenSSL types for IntelliSense
typedef struct evp_md_ctx_st EVP_MD_CTX;
typedef struct evp_md_st EVP_MD;
typedef struct engine_st ENGINE;

// Mock OpenSSL functions for IntelliSense
EVP_MD_CTX *EVP_MD_CTX_new(void);
int EVP_MD_CTX_free(EVP_MD_CTX *ctx);
int EVP_DigestInit_ex(EVP_MD_CTX *ctx, const EVP_MD *type, ENGINE *impl);
int EVP_DigestUpdate(EVP_MD_CTX *ctx, const void *d, unsigned long cnt);
int EVP_DigestFinal_ex(EVP_MD_CTX *ctx, unsigned char *md, unsigned int *s);
const EVP_MD *EVP_sha256(void);
const EVP_MD *EVP_sha3_256(void);

// Mock additional OpenSSL functionality
int RAND_bytes(unsigned char *buf, int num);
int CRYPTO_get_ex_new_index(int class_index, long argl, void *argp, 
                           void *new_func, void *dup_func, void *free_func);

// Mock SSL/TLS structures
typedef struct ssl_st SSL;
typedef struct ssl_ctx_st SSL_CTX;
typedef struct ssl_method_st SSL_METHOD;

// Mock SSL functions
SSL_CTX *SSL_CTX_new(const SSL_METHOD *method);
void SSL_CTX_free(SSL_CTX *ctx);
SSL *SSL_new(SSL_CTX *ctx);
void SSL_free(SSL *ssl);
int SSL_connect(SSL *ssl);
int SSL_read(SSL *ssl, void *buf, int num);
int SSL_write(SSL *ssl, const void *buf, int num);

const SSL_METHOD *TLS_client_method(void);
const SSL_METHOD *TLS_server_method(void);

#ifdef __cplusplus
}
#endif

#endif // TRADING_ANARCHY_OPENSSL_MOCK_H