FROM node:22.16

WORKDIR /app

RUN npm install -g pnpm@11.24.0

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile || pnpm approve-builds --all && pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

ENTRYPOINT []

CMD ["pnpm", "dev"]
