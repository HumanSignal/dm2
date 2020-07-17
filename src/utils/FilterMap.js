
import {
    GlobalFilter,
    DefaultColumnFilter,
    SelectColumnFilter,
    SliderColumnFilter,
    NumberRangeColumnFilter,
    fuzzyTextFilterFn,
    filterGreaterThan
} from "../components/Filters";

// based on the assumption that every accessor is unique
const map = {
    'id': [ SliderColumnFilter, filterGreaterThan ],
    'status': [ SelectColumnFilter, 'includes' ]
}

function findClass(field) {
    if (!(field.accessor in map)) return null;
    return map[field.accessor][0]
}

function findType(field) {
    if (!(field.accessor in map)) return null;
    return map[field.accessor][1]
}

export default {
    findClass,
    findType
}
