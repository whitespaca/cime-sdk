import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // 라이브러리 진입점
  format: ['cjs', 'esm'],  // CommonJS와 ES Modules 모두 생성 (모든 환경 호환)
  dts: true,               // 타입스크립트 선언 파일(.d.ts) 생성 (IDE 자동완성에 필수)
  splitting: false,        // 단일 파일 출력으로 패키지 용량 최적화
  sourcemap: true,         // 디버깅을 위한 소스맵 생성
  clean: true,             // 빌드 전 이전 dist 폴더 정리
  treeshake: true,         // 사용하지 않는 코드 제거 (번들 크기 최소화)
  minify: false,           // 라이브러리 코드이므로 가독성을 위해 minify는 비활성 (또는 선택)
});