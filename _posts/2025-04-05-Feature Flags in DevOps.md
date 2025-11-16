---
layout: post
title: "🚩 Feature Flags in DevOps"
date: 2025-04-05
categories: [DevOps, CI/CD, Release Management]
tags: [feature flags, DevOps, CI/CD, rollout, feature toggles]
description: "Use feature flags to deploy code safely, control feature rollout, and test in production without downtime."
keywords: [feature flags, DevOps, CI/CD, rollout, feature toggles, safe deployment]
---

## Feature Flags in DevOps

Feature flags enable **dynamic control over new features** without redeploying applications. They allow testing in production, gradual rollout, and safe rollback.

---

### Why Feature Flags Matter

- **Safe Deployments:** Deploy incomplete features without impacting users  
- **Gradual Rollout:** Target specific users or percentages  
- **A/B Testing:** Test features in production  
- **Instant Rollback:** Disable features without redeploying  

---

### Workflow Example

1. Implement feature flags in code  
2. Control flags via configuration service or dashboard  
3. Deploy application with flags off by default  
4. Gradually enable flags for testing or specific users  
5. Monitor behavior and metrics  

### Visual Diagram
{% raw %}
<div class="mermaid">
flowchart 
    A[Feature Flag Config] --> B[Deploy App]
    B --> C[Gradual Rollout]
    C --> D[Monitor Metrics]
    D --> E{Issues Detected?}
    E -->|Yes| F[Disable Feature]
    E -->|No| G[Full Release]
</div>
{% endraw %}

---

### Sample Code Snippet
```python
class FeatureFlag:
    def __init__(self):
        self.flags = {}

    def set_flag(self, name, state):
        self.flags[name] = state

    def is_enabled(self, name):
        return self.flags.get(name, False)
# Usage
feature_flags = FeatureFlag()
feature_flags.set_flag("new_ui", True)
if feature_flags.is_enabled("new_ui"):
    print("New UI is enabled")
else:
    print("New UI is disabled")
```
---

### Sample LaunchDarkly Integration (Node.js)
```javascript
const { LDClient } = require('launchdarkly-node-server-sdk');
const ldClient = LDClient.init('SDK_KEY');

ldClient.waitForInitialization().then(() => {
  const showFeature = ldClient.variation('new-feature-flag', { key: 'user123' }, false);
  if (showFeature) {
    console.log('Feature enabled for user');
  }
});
```
---
### Sample Unleash Integration (Java)
```java
import no.finn.unleash.DefaultUnleash;
import no.finn.unleash.Unleash;
import no.finn.unleash.strategy.Strategy;
import no.finn.unleash.util.UnleashConfig;
UnleashConfig config = UnleashConfig.builder()
    .appName("my-app")
    .instanceId("instance-1")
    .unleashAPI("http://unleash-server/api/")
    .build();
Unleash unleash = new DefaultUnleash(config);
boolean isEnabled = unleash.isEnabled("new-feature-flag");
if (isEnabled) {
    System.out.println("Feature is enabled");
} else {
    System.out.println("Feature is disabled");
}
```
---

### Best Practices

- Keep feature flags short-lived and remove unused flags
- Use targeting rules for staged rollouts
- Monitor feature performance and metrics
- Automate enabling/disabling through CI/CD

---

### Common Pitfalls

- Long-lived feature flags increasing code complexity
- Not monitoring metrics after rollout
- Hardcoding flags instead of using centralized management

## Conclusion

Feature flags provide flexibility, safe rollouts, and testing in production, empowering DevOps teams to release faster and reduce risk.