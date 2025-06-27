import { toast } from "sonner";

const promiseStore = new Map();

export function setPromise(section, file, resolver) {
  const key = `${section}/${file}`;
  promiseStore.set(key, resolver);
}

export function getPromise(section, file){
    const key = `${section}/${file}`;
    const resolver = promiseStore.get(key)
    return resolver
}
export function resolvePromise(section, file) {
    const key = `${section}/${file}`;
  const resolver = promiseStore.get(key);
  if (resolver) {
    resolver(); 
    promiseStore.delete(key); 
  }
}

export function clearPromise(section, file) {
  const key = `${section}/${file}`;
  console.log(promiseStore.get(key))
  toast.dismiss(key)
  promiseStore.delete(key);

}