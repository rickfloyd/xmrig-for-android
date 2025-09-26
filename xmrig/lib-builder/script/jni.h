/*
 * Mock JNI Header for IntelliSense
 * This file provides basic JNI definitions for code completion
 */

#ifndef _JNI_H_
#define _JNI_H_

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

// Basic JNI types
typedef uint8_t     jboolean;
typedef int8_t      jbyte;
typedef uint16_t    jchar;
typedef int16_t     jshort;
typedef int32_t     jint;
typedef int64_t     jlong;
typedef float       jfloat;
typedef double      jdouble;
typedef jint        jsize;

// JNI object types
struct _jobject;
typedef struct _jobject *jobject;
typedef jobject jclass;
typedef jobject jstring;
typedef jobject jarray;
typedef jobject jobjectArray;
typedef jobject jbooleanArray;
typedef jobject jbyteArray;
typedef jobject jcharArray;
typedef jobject jshortArray;
typedef jobject jintArray;
typedef jobject jlongArray;
typedef jobject jfloatArray;
typedef jobject jdoubleArray;
typedef jobject jthrowable;
typedef jobject jweak;

// JNI field and method IDs
struct _jfieldID;
typedef struct _jfieldID *jfieldID;
struct _jmethodID;
typedef struct _jmethodID *jmethodID;

// JNI value union
typedef union jvalue {
    jboolean z;
    jbyte    b;
    jchar    c;
    jshort   s;
    jint     i;
    jlong    j;
    jfloat   f;
    jdouble  d;
    jobject  l;
} jvalue;

// JNI Environment
struct JNINativeInterface;
struct JNIInvokeInterface;

typedef const struct JNINativeInterface *JNIEnv;
typedef const struct JNIInvokeInterface *JavaVM;

// JNI constants
#define JNI_VERSION_1_1 0x00010001
#define JNI_VERSION_1_2 0x00010002
#define JNI_VERSION_1_4 0x00010004
#define JNI_VERSION_1_6 0x00010006

#define JNI_OK        0
#define JNI_ERR       (-1)
#define JNI_EDETACHED (-2)
#define JNI_EVERSION  (-3)

#define JNI_TRUE  1
#define JNI_FALSE 0

#define JNI_COMMIT 1
#define JNI_ABORT  2

// JNI calling convention
#ifndef JNIEXPORT
#define JNIEXPORT
#endif

#ifndef JNICALL
#define JNICALL
#endif

#ifdef __cplusplus
}
#endif

#endif /* _JNI_H_ */