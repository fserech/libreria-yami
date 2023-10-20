export const REGEX_TEXT_WITHOUT_SPACES: RegExp = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]+$/;
export const REGUEX_NUMBERS_FLOAT: RegExp = /^(?!0\d)(?!999999\d)(?!0$)\d{1,6}(?:\.\d{1,2})?$/;
export const REGEX_NUMBERS_INT: RegExp = /^[1-9]\d*$/;
export const REGEX_NUMBERS_DECIMALS: RegExp = /^(0\.[1-9]\d{0,1}|[1-9]\d*\.\d{1,2})$/;
export const REGEX_TEX: RegExp = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\d]+(?:[ ]?[a-zA-ZáéíóúÁÉÍÓÚñÑ\d]+)*$/;
export const REGEX_TEXT_DASHES: RegExp = /^[a-zA-Z0-9-]+$/;
