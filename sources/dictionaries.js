exports.ECHI = {
    AENT : {
        IFID : 'unsigned' },

    BRSH : {
        IFID : 'unsigned',
        TYPE : 'unsigned' },

    FACE : {
        IFID : 'unsigned',
        NORX : 'float',
        NORY : 'float',
        NORZ : 'float',
        PLND : 'float',
        TROT : 'float',
        SCAS : 'float',
        SCAT : 'float',
        SHIS : 'float',
        SHIT : 'float',
        COLO : null,
        TEXN : 'string' },

    PLGT : {
        IFID : 'unsigned',
        POSX : 'float',
        POSY : 'float',
        POSZ : 'float',
        RADI : 'float',
        COLR : 'float',
        COLG : 'float',
        COLB : 'float' },

    UENT : {
        IFID : 'unsigned',
        POSX : 'float',
        POSY : 'float',
        POSZ : 'float',
        NAME : 'string' } };

exports.WRLD = {
    IFID : 'unsigned',
    ENAM : 'string',
    HIDE : 'boolean',

    TXPU : 'float',
    NOTS : 'boolean',
    NOTE : 'string',
    LNKS : { FRST : 'unsigned', SCND : 'unsigned' },
    ECHI : exports.ECHI };

exports.XTRA = {
    BGEO : {
        BRSH : {
            IFID : 'unsigned',
            BFCT : 'unsigned',
            FACE : {
                TEXN : 'string',
                SFCT : 'unsigned',
                SUBF : {
                    LMID : 'signed',
                    VCNT : 'unsigned',
                    VERT : 'vertice' } } } },

    TEXD : {
        TXTR : {
            TEXN : 'string',
            TWID : 'unsigned',
            THEI : 'unsigned',
            PFMT : 'unsigned',
            DATA : null } } };

exports.ROOT = {
    RTWF : {
        VRSN : 'unsigned',
        WRLD : exports.WRLD,
        XTRA : exports.XTRA } };

exports.ECHI.AENT.ECHI = exports.ECHI;
exports.ECHI.BRSH.ECHI = { FACE : exports.ECHI.FACE };
