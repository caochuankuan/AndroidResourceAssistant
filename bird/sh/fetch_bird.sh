#!/bin/bash

# 批量获取所有鸟的数据
# 1. 先获取图鉴列表的所有页
# 2. 提取每个鸟的 ID
# 3. 逐个请求鸟的详细信息
# 4. 提取需要的字段并保存到 response.txt

AUTH_HEADER="authorization: e3R5cDxxxxxxxxxxxxxxxxxx"
OUTPUT_FILE="sh/bird.json"

# 清空输出文件
echo "{" > "$OUTPUT_FILE"
echo "  \"birds\": [" >> "$OUTPUT_FILE"

# 首先获取第一页来确定总页数
first_page=$(curl -s -X GET "http://82.157.255.108/api/storage/books?page=0" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json")

total_pages=$(echo "$first_page" | jq -r '.data.page.totalPages')

echo "总共 $total_pages 页"

first_item=true

# 遍历所有页
for ((page=0; page<total_pages; page++)); do
  echo "正在处理第 $((page+1))/$total_pages 页..."
  
  # 获取当前页的图鉴数据
  books_response=$(curl -s -X GET "http://82.157.255.108/api/storage/books?page=$page" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json")
  
  # 提取所有鸟的 ID
  bird_ids=$(echo "$books_response" | jq -r '.data.content[][0]')
  
  # 遍历每个鸟的 ID
  for bird_id in $bird_ids; do
    echo "  获取鸟 ID: $bird_id"
    
    # 获取鸟的详细信息
    bird_response=$(curl -s -X GET "http://82.157.255.108/api/shop/bird?id=$bird_id" \
      -H "$AUTH_HEADER" \
      -H "Content-Type: application/json")
    
    # 提取需要的字段（压缩为一行）
    bird_data=$(echo "$bird_response" | jq -c '{
      i: .data.i,
      name: .data.name,
      period: .data.period,
      ws: .data.ws,
      we: .data.we,
      exp: .data.exp,
      skill: (
        if .data.s1 != 0 then {
          skillId: .data.s1,
          position: "s1",
          skillName: .data.skill.name,
          skillDescription: .data.skill.description
        }
        elif .data.s2 != 0 then {
          skillId: .data.s2,
          position: "s2",
          skillName: .data.skill.name,
          skillDescription: .data.skill.description
        }
        elif .data.s3 != 0 then {
          skillId: .data.s3,
          position: "s3",
          skillName: .data.skill.name,
          skillDescription: .data.skill.description
        }
        else null
        end
      ),
      baitName: .data.catchableBaits[0].n,
      baitField: .data.catchableBaits[0].field
    }')
    
    # 添加到输出文件（每只鸟一行，逗号在末尾）
    if [ "$first_item" = true ]; then
      echo -n "    $bird_data" >> "$OUTPUT_FILE"
      first_item=false
    else
      echo "," >> "$OUTPUT_FILE"
      echo -n "    $bird_data" >> "$OUTPUT_FILE"
    fi
    
    # 避免请求过快
    sleep 0.1
  done
done

# 关闭 JSON 对象
echo "" >> "$OUTPUT_FILE"
echo "  ]" >> "$OUTPUT_FILE"
echo "}" >> "$OUTPUT_FILE"

echo "完成！所有数据已保存到 $OUTPUT_FILE"
