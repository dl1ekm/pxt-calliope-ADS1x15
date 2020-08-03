
/**
 * Control ADS1115 ADC 
 * 
 * Only Single-Shot-Mode support
 * so data sample rate set to fixed lowest value
 */

/**************************
 * GAIN Mapping 
 **************************/
enum ADS1x15_GAIN {
    //% block="2/3 (+/-6.144V)"
    G2_3 = 0x0000,  // +/-6.144V range = Gain 2/3
    //% block="1 (+/-4.096V)"
    G1   = 0x0200,  // +/-4.096V range = Gain 1
    //% block="2 (+/-2.048V)"
    G2   = 0x0400,  // +/-2.048V range = Gain 2
    //% block="4 (+/-1.024V)"    
    G4   = 0x0600,  // +/-1.024V range = Gain 4
    //% block="8 (+/-0.512V)"
    G8   = 0x0800,  // +/-0.512V range = Gain 8
    //% block="16 (+/-0.256V)"    
    G16  = 0x0A00   // +/-0.256V range = Gain 16
}

/**************************
 * Address Mapping 
 **************************/
enum ADS1x15_ADRESS {
    //% block="0x48 (default)"
    Address_48 = 0x48,  
    //% block="0x49"
    Address_49 = 0x49,
    //% block="0x4A"
    Address_4A = 0x4A,
    //% block="0x4B"
    Address_4B = 0x4B
}

/**************************
 * Chip Type 
 **************************/
enum CHIP_TYPE {
    //% block="ADS1115"
    ADS1115,
    //% block="ADS1015"
    ADS1015
}

/**************************
 * Channel 
 **************************/
enum CHANNEL_TYPE {
    //% block="AIN0"
    AIN0 = 0,
    //% block="AIN1"
    AIN1 = 1,
    //% block="AIN2"
    AIN2 = 2,
    //% block="AIN3"
    AIN3 = 3
}

/**
 * Benutzerdefinierte Blöcke
 */
//% weight=100 color=#0fbc11 icon=""
namespace ADS1x15 {



    /*=========================================================================
        I2C ADDRESS/BITS
        -----------------------------------------------------------------------*/
    const ADS1x15_ADDRESS                   = 0x48;    // Default-Adresse
    /*=========================================================================*/

    /*=========================================================================
        CONVERSION DELAY (in mS)
        -----------------------------------------------------------------------*/
    const ADS1115_CONVERSIONDELAY           = 9;        // Conversion delay
    const ADS1015_CONVERSIONDELAY           = 7;        // Conversion delay
    /*=========================================================================*/
    
    /*=========================================================================
        POINTER REGISTER AND OTHERS
        -----------------------------------------------------------------------*/
    const ADS1x15_REG_POINTER_CONVERT       = 0x00;     // Conversion
    const ADS1x15_REG_POINTER_CONFIG        = 0x01;     // Configuration
    const ADS1x15_REG_POINTER_LOWTHRESH     = 0x02;     // Low threshold
    const ADS1x15_REG_POINTER_HITHRESH      = 0x03;     // High threshold
    const ADS1x15_REG_POINTER_MASK          = 0x03;     // Pointer mask

    /*=========================================================================*/

    /*=========================================================================
        CONFIG REGISTER
        -----------------------------------------------------------------------*/
    const ADS1x15_REG_CONFIG_OS_MASK        = 0x8000;   // OS Mask
    const ADS1x15_REG_CONFIG_OS_SINGLE      = 0x8000;   // Write: Set to start a single-conversion
    const ADS1x15_REG_CONFIG_MUX_MASK       = 0x7000;   // Mux Mask

    const ADS1x15_REG_CONFIG_MUX_SINGLE_0   = 0x4000;   // Single-ended AIN0
    const ADS1x15_REG_CONFIG_MUX_SINGLE_1   = 0x5000;   // Single-ended AIN1
    const ADS1x15_REG_CONFIG_MUX_SINGLE_2   = 0x6000;   // Single-ended AIN2
    const ADS1x15_REG_CONFIG_MUX_SINGLE_3   = 0x7000;   // Single-ended AIN3

    const ADS1x15_REG_CONFIG_MODE_MASK      = 0x0100;   // Mode Mask
    const ADS1x15_REG_CONFIG_MODE_CONTIN    = 0x0000;   // Continuous conversion mode
    const ADS1x15_REG_CONFIG_MODE_SINGLE    = 0x0100;   // Power-down single-shot mode (default)

    const ADS1x15_REG_CONFIG_DR_MASK        = 0x00E0;   // Data Rate Mask
    const ADS1015_REG_CONFIG_DR_128SPS      = 0x0000;   // Data Rate Mask (jeweils 128er Sample-Rate)
    const ADS1115_REG_CONFIG_DR_128SPS      = 0x0080;   // Data Rate Mask (jeweils 128er Sample-Rate)

    const ADS1x15_REG_CONFIG_CMODE_TRAD     = 0x0000;   // Traditional comparator with hysteresis (default)
    const ADS1x15_REG_CONFIG_CPOL_ACTVLOW   = 0x0000;   // ALERT/RDY pin is low when active (default)
    const ADS1x15_REG_CONFIG_CLAT_NONLAT    = 0x0000;   // Non-latching comparator (default)
    const ADS1x15_REG_CONFIG_CQUE_NONE      = 0x0003;   // Disable the comparator and put ALERT/RDY in high state (default)
    
    /*=========================================================================*/


    /*=========================================================================
        Variables
        -----------------------------------------------------------------------*/
    let Chip_Type = CHIP_TYPE.ADS1115;
    let Chip_Address = 0x48;
    let Chip_Gain = 0x0000;
    let conversionDelay = ADS1115_CONVERSIONDELAY;
    let bitShift = 0;

    /*=========================================================================*/
    

    //% block="Read ADC Channel: %channel|Gain: %gain|Address: %address|Chip Type: %chiptype" 
    export function readADC(channel: CHANNEL_TYPE, gain: ADS1x15_GAIN,  address: ADS1x15_ADRESS, chiptype: CHIP_TYPE): number {
        Chip_Address = address;
        Chip_Type = chiptype;
        Chip_Gain = gain;

        switch (Chip_Type) {
            case CHIP_TYPE.ADS1115:
                conversionDelay = ADS1115_CONVERSIONDELAY;
                bitShift = 0;
                break;
            case CHIP_TYPE.ADS1015:
                conversionDelay = ADS1015_CONVERSIONDELAY;
                bitShift = 4;
                break;
        }

        let config = 0;
        config = 
            ADS1x15_REG_CONFIG_CQUE_NONE |    // Disable the comparator (default val)
            ADS1x15_REG_CONFIG_CLAT_NONLAT |  // Non-latching (default val)
            ADS1x15_REG_CONFIG_CPOL_ACTVLOW | // Alert/Rdy active low   (default val)
            ADS1x15_REG_CONFIG_CMODE_TRAD |   // Traditional comparator (default val)
            ADS1x15_REG_CONFIG_MODE_SINGLE;   // Single-shot mode (default)
        
        switch (Chip_Type) {
            case CHIP_TYPE.ADS1115:
                config |= ADS1115_REG_CONFIG_DR_128SPS;   // 128 samples per second (default)
                break;
            case CHIP_TYPE.ADS1015:
                config |= ADS1015_REG_CONFIG_DR_128SPS;   // 128 samples per second (default)
                break;
        }

        // Set PGA/voltage range
        config |= Chip_Gain;

        switch (channel) {
            case CHANNEL_TYPE.AIN0:
                config |= ADS1x15_REG_CONFIG_MUX_SINGLE_0;
                break;
            case CHANNEL_TYPE.AIN1:
                config |= ADS1x15_REG_CONFIG_MUX_SINGLE_1;
                break;
            case CHANNEL_TYPE.AIN2:
                config |= ADS1x15_REG_CONFIG_MUX_SINGLE_2;
                break;
            case CHANNEL_TYPE.AIN3:
                config |= ADS1x15_REG_CONFIG_MUX_SINGLE_3;
                break;
        }

        // Set 'start single-conversion' bit
        config |= ADS1x15_REG_CONFIG_OS_SINGLE;

        // Start Single Conversation
        // -------------------------

        // create 3 bytes to send: Pointer-Config, MSB-Config, LSB-Confic 
        // and add a 4th empty byte to fill 32bit 
        let request = ADS1x15_REG_POINTER_CONFIG;
        request = (request << 8) + (config >> 8);
        request = (request << 8) + (config & 0xFF);
        request = (request << 8);
    
        // pins.i2cWriteNumber((Chip_Address << 1) + 0, request, NumberFormat.UInt32BE);
        pins.i2cWriteNumber(Chip_Address, request, NumberFormat.UInt32BE);

        // Wait for the conversion to complete
        // -----------------------------------
        basic.pause(conversionDelay);
    
        // Read the conversion results
        // ---------------------------

        // Write "0" to Pointer Register
        pins.i2cWriteNumber(Chip_Address, ADS1x15_REG_POINTER_CONVERT, NumberFormat.UInt8BE);

        // Read 2 bytes from I2C
        // Shift 12-bit results right 4 bits for the ADS1015, 0 bits for the ADS1115
        return pins.i2cReadNumber(Chip_Address , NumberFormat.Int16BE) >> bitShift;

    }
}
 
