import { Ref } from "vue";

export type ReadonlyRef<T = unknown> = Ref<T, never>;

export type DeepPartial<T extends object> = {
    [P in keyof T]?: NonNullable<T[P]> extends object
        ? DeepPartial<NonNullable<T[P]>> | null
        : T[P] | null;
};
