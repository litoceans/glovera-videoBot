module.exports = {
    apps: [
    {
            name: "AI-Avatar-Frontend",
            script: "npm",
            args: "start -- --port 3001",
            env: {
                    NODE_ENV: "production",
                },
        },
    ],
};