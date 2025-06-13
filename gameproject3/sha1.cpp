#include <cstddef>  // C++の場合（推奨）
#include "sha1.h"
#include <string.h>

#define ROTLEFT(a,b) (((a) << (b)) | ((a) >> (32-(b))))

SHA1::SHA1() {
    reset();
}

void SHA1::reset() {
    h0 = 0x67452301;
    h1 = 0xEFCDAB89;
    h2 = 0x98BADCFE;
    h3 = 0x10325476;
    h4 = 0xC3D2E1F0;
    messageLength = 0;
    bufferOffset = 0;
}

void SHA1::update(const uint8_t* data, size_t len) {
    while (len--) {
        buffer[bufferOffset++] = *data++;
        messageLength += 8;
        if (bufferOffset == 64) {
            processBlock(buffer);
            bufferOffset = 0;
        }
    }
}

void SHA1::finalize(uint8_t hash[20]) {
    buffer[bufferOffset++] = 0x80;
    if (bufferOffset > 56) {
        while (bufferOffset < 64) buffer[bufferOffset++] = 0;
        processBlock(buffer);
        bufferOffset = 0;
    }
    while (bufferOffset < 56) buffer[bufferOffset++] = 0;

    uint64_t bits = messageLength;
    for (int i = 7; i >= 0; i--) buffer[bufferOffset++] = bits >> (i * 8);

    processBlock(buffer);

    uint32_t* out = (uint32_t*)hash;
    out[0] = __builtin_bswap32(h0);
    out[1] = __builtin_bswap32(h1);
    out[2] = __builtin_bswap32(h2);
    out[3] = __builtin_bswap32(h3);
    out[4] = __builtin_bswap32(h4);
}

void SHA1::processBlock(const uint8_t* block) {
    uint32_t w[80];
    for (int i = 0; i < 16; i++) {
        w[i] = (block[i*4] << 24) |
               (block[i*4+1] << 16) |
               (block[i*4+2] << 8) |
               (block[i*4+3]);
    }
    for (int i = 16; i < 80; i++) {
        w[i] = ROTLEFT(w[i-3] ^ w[i-8] ^ w[i-14] ^ w[i-16], 1);
    }

    uint32_t a = h0, b = h1, c = h2, d = h3, e = h4;

    for (int i = 0; i < 80; i++) {
        uint32_t f, k;
        if (i < 20) {
            f = (b & c) | ((~b) & d);
            k = 0x5A827999;
        } else if (i < 40) {
            f = b ^ c ^ d;
            k = 0x6ED9EBA1;
        } else if (i < 60) {
            f = (b & c) | (b & d) | (c & d);
            k = 0x8F1BBCDC;
        } else {
            f = b ^ c ^ d;
            k = 0xCA62C1D6;
        }
        uint32_t temp = ROTLEFT(a, 5) + f + e + k + w[i];
        e = d;
        d = c;
        c = ROTLEFT(b, 30);
        b = a;
        a = temp;
    }

    h0 += a;
    h1 += b;
    h2 += c;
    h3 += d;
    h4 += e;
}
