#ifndef SHA1_H
#define SHA1_H

#include <stdint.h>

class SHA1 {
public:
    SHA1();
    void reset();
    void update(const uint8_t* data, size_t len);
    void finalize(uint8_t hash[20]);

private:
    void processBlock(const uint8_t* block);
    uint32_t h0, h1, h2, h3, h4;
    uint64_t messageLength;
    uint8_t buffer[64];
    size_t bufferOffset;
};

#endif
