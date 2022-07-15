import { MonoApiHelper, MonoApi } from 'frida-mono-api'

let status = Memory.alloc(0x4);

let sysAsm = MonoApi.mono_assembly_load_with_partial_name(Memory.allocUtf8String('System'), status);
console.log(`Assembly @ ${sysAsm} loaded with result ${status.readInt()}`);

let sysImg = MonoApi.mono_assembly_get_image(sysAsm);
console.log(`Image @ ${sysImg}`);

let tlsClass = MonoApiHelper.ClassFromName(sysImg, 'Mono.Net.Security.MobileTlsContext');
console.log(`MobileTlsContext class @ ${tlsClass}`);

let validateMethod = MonoApiHelper.ClassGetMethodFromName(tlsClass, 'ValidateCertificate');
console.log(`Method @ ${validateMethod}`);

let validateCompiled = MonoApiHelper.CompileMethod(validateMethod);
console.log(`Compiled @ ${validateCompiled}`);

Interceptor.attach(validateCompiled, {
    onLeave: (ret) => {
        if (ret == 0) {
            console.log(`Certificate is invalid, patching...`);
            ret.replace(1);
        }
    }
});