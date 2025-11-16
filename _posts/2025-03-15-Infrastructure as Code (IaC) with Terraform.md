---
layout: post
title: "🛠️ Infrastructure as Code with Terraform"
date: 2025-03-15
categories: [DevOps, Infrastructure, Automation]
tags: [Terraform, IaC, DevOps, cloud, automation]
description: "Learn how to manage cloud infrastructure declaratively with Terraform, enabling reproducible, version-controlled, and automated deployments."
keywords: [Terraform, IaC, DevOps, cloud infrastructure, automation, reproducible deployments]
---

## Infrastructure as Code (IaC) with Terraform

Terraform allows you to **define infrastructure as code**, enabling automated, consistent, and repeatable deployments across environments.

---

### Why Terraform Matters

- **Version Control:** Track changes to infrastructure  
- **Automation:** Reduce manual provisioning errors  
- **Consistency:** Avoid drift between environments  
- **Scalability:** Deploy multi-cloud or hybrid infrastructure easily  

---

### Example Workflow

1. Write Terraform configurations  
2. Initialize Terraform and plan changes  
3. Apply configurations to provision resources  
4. Monitor and update resources via code  
5. Destroy or rollback environments as needed  

### Visual Diagram
{% raw %}
<div class="mermaid">
flowchart TD
    A[Write Terraform Code] --> B[terraform init & plan]
    B --> C[terraform apply]
    C --> D[Provision Resources]
    D --> E[Monitor & Update]
    E --> F[terraform destroy if needed]
</div>
{% endraw %}

---

### Sample Code Snippet
```hcl
provider "aws" {
  region = "us-west-2"
}
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "TerraformExample"
  }
}
resource "aws_s3_bucket" "app_bucket" {
  bucket = "my-app-bucket"
  acl    = "private"
}
```

---

### Best Practices

- Modularize Terraform code for reusability
- Use state files securely (e.g., S3 with locking)
- Review plans before applying changes
- Version control everything

---

### Common Pitfalls

- Manual changes outside IaC causing drift
- Not securing state files (leaks secrets)
- Mixing environments in the same configuration
- Ignoring Terraform version compatibility

## Conclusion

Terraform empowers DevOps teams to manage infrastructure declaratively, safely, and consistently, reducing errors and enabling automation.