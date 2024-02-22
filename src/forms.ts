import {FieldContext, GenericObject, useField, useForm} from "vee-validate";
import {InferType, ObjectSchema} from "yup";

export const useFormSchema = <S extends GenericObject, T extends ObjectSchema<S>>(schema: T) => {
  return {
    form: useForm<InferType<T>>({
      validationSchema: schema.fields
    }),
    formData: Object.fromEntries(Object.keys(schema.fields).map(key => [key, useField(key)])) as {
      [K in keyof InferType<T>]: FieldContext<InferType<T>[K]>
    },
    schema
  }
}
