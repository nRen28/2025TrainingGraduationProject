#include "base64.h"

static const char base64_table[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

String base64encode(const uint8_t* data, size_t len) {
    String result;
    int i;
    for (i = 0; i < len - 2; i += 3) {
        result += base64_table[(data[i] >> 2) & 0x3F];
        result += base64_table[((data[i] & 0x3) << 4) | ((data[i+1] >> 4) & 0x0F)];
        result += base64_table[((data[i+1] & 0x0F) << 2) | ((data[i+2] >> 6) & 0x03)];
        result += base64_table[data[i+2] & 0x3F];
    }
    if (i < len) {
        result += base64_table[(data[i] >> 2) & 0x3F];
        if (i == len - 1) {
            result += base64_table[(data[i] & 0x3) << 4];
            result += "==";
        } else {
            result += base64_table[((data[i] & 0x3) << 4) | ((data[i+1] >> 4) & 0x0F)];
            result += base64_table[(data[i+1] & 0x0F) << 2];
            result += "=";
        }
    }
    return result;
}
